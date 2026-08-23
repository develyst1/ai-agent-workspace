# SPEC-002: Use Template — compose photos into a saved layout and export a PNG
- Source: REQ-002
- Status: ACTIVE
- Author: Sober (SA) — 2026-08-23

## 0. Baseline — verified, not assumed

Designed against the real tree at **`e6faa0f`** (`develop`), read-only `git` only.
Checked by me on 2026-08-23, closing the carry-over Porter left in the 2026-08-23 log:

- `git status --porcelain` is **empty** — the tree is clean.
- `git diff --name-status 1d07fc8 e6faa0f` is **exactly the five files** of TASK-004's
  accepted round-2 packet: `M src/App.tsx`, `M src/components/Toolbar.tsx`,
  `M src/store/designerStore.ts`, `A src/components/AppShell.tsx`, `A src/store/uiStore.ts`.
- All five sha256(16) match the accepted packet byte for byte (`8cffd7e9304e142e`,
  `937a4eb441193ef0`, `456cd58c15190d62`, `9ad09ef786f132dd`, `0041466b55dfd7d2`).

So `e6faa0f` **is** what TASK-004 was accepted as, with nothing extra. Nothing to route
back to Porter. SPEC-001 §10 still governs hand-off: work leaves an engineer
**uncommitted**, as base SHA + porcelain + sha256 packet; every git write is the human's.

## 1. Overview

REQ-002 turns the disabled second mode into a working one and adds one property to the
slot model. Three moving parts, in order of how far they reach:

1. **The slot gains `required: boolean`** (REQ-002 Req 15). It is set in the Layout
   Designer, written into the template file, and read back. A file that has no such
   field — every template the human already owns — loads with **every slot required**.
   This is the *only* change to the designer and to the file format.
2. **Two new IPC channels** (§4): the renderer cannot touch the filesystem, so photo
   bytes come in and PNG bytes go out over the seam, exactly like template JSON does.
3. **A second renderer mode** (§6), with its own Zustand store, its own Konva stage and
   its own panel. It never reads the designer's store — the user picks a `.json` file
   every time (Req 2).

Design principles carried over from SPEC-001 and **not** re-opened here: all Thai text
lives in `src/i18n/th.ts` and nowhere else; main contains no user-facing string and gets
its dialog titles as parameters; failures cross the seam as machine codes; validation of
a template file happens exactly once, in `parseTemplateFile`.

**Why the compositor is a plain 2D canvas and not Konva.** The finished PNG is produced
by drawing into an offscreen `HTMLCanvasElement` sized `canvasWidth x canvasHeight`, not
by exporting the preview stage. Reasons: the stage is scaled-to-fit and capped at 1
(SPEC-001 §5), so exporting it would need a pixelRatio round-trip that is exactly where
off-by-one crops come from; a bare canvas that is never filled is transparent by default,
which is Req 12 for free; and the geometry then lives in one pure function (§5) that can
be checked without a DOM. The preview uses the same pure function, so what the user sees
and what he gets are the same arithmetic.

## 2. Repository layout — what is added

```
shared/
└─ contract.ts              +required, formatVersion 2, +2 channels   (Jason, TASK-005)
electron/
├─ preload.ts               +pickImages, +savePng                     (Jason, TASK-005)
└─ ipc/image.ts             NEW — image:pick / png:save handlers      (Jason, TASK-005)
src/
├─ lib/cover.ts             NEW — coverSourceRect (pure)              (Fern, TASK-008)
├─ lib/template.ts          NEW — normalizeZIndex + normalizeTemplate (Fern, TASK-007)
├─ lib/compose.ts           NEW — composeTemplateToCanvas             (Fern, TASK-009)
├─ store/useTemplateStore.ts NEW                                      (Fern, TASK-007)
├─ components/UseTemplateView.tsx      NEW                            (Fern, TASK-007)
├─ components/UseTemplateCanvas.tsx    NEW                            (Fern, TASK-007)
├─ components/UseTemplateSlotPanel.tsx NEW                            (Fern, TASK-007/008)
└─ i18n/th.ts               +the §7 keys, -mode.useTemplate.badge     (Fern)
```

Ownership is unchanged (PROTOCOL "Repo layout & ownership"): `electron/`, `shared/` and
build config are **Jason's**; `src/` is **Fern's**. `shared/contract.ts` stays read-only
for Fern — §4 below is the whole contract, and anything missing from it is a `## Questions`
entry to me, never a local edit.

## 3. Data model — template JSON, format version 2

```json
{
  "formatVersion": 2,
  "name": "my-template",
  "canvasWidth": 1080,
  "canvasHeight": 1920,
  "slots": [
    { "id": "b1f0…", "name": "slot 1", "x": 40, "y": 40, "width": 300, "height": 300,
      "zIndex": 0, "color": "#4f8ef7", "required": true }
  ]
}
```

Everything SPEC-001 §3 says still holds — trailing newline, 2-space indent, integers
rounded on save, `zIndex` authoritative, names trimmed on read, the §3 reject list. **One
field is added and one rule changes:**

- **`required` — boolean.** `true` = Generate refuses while this slot is empty;
  `false` = an empty slot is simply transparent in the output (Req 12/14).
- **`formatVersion` is now written as `2`**, and `parseTemplateFile` accepts
  **absent, `1`, or `2`** and rejects anything else. Absent and `1` are the same thing:
  a REQ-001-era file. This is what SPEC-001 §3 kept the field for
  (*"so REQ-002 can evolve the shape without silently misreading old files"*). **SA call
  B-1** — see §9.
- **Backward compatibility is a parser rule, not a UI rule** (Req 15c / B19):
  `parseTemplateFile` **fills in `required: true` when the field is absent**, so every
  consumer downstream sees a non-optional `required: boolean` and no component, store or
  compositor ever has to know which version the file came from. `SlotData.required` is
  therefore **not** optional in TypeScript.
- A `required` that is *present but not a boolean* is a **rejection**
  (`error.fileUnreadable`), same philosophy as the rest of §3: reject what this app's own
  UI can never write. Absent is legal; `"yes"` is not.
- Forward direction: a v2 file opened by anything that only knows v1 is rejected, which
  is the honest outcome and costs nothing — there is one installed app.

## 4. The IPC seam (owned by Sober — do not extend without a SPEC change)

Added to `shared/contract.ts`. **The two REQ-001 channels are untouched**; their types,
names and behaviour do not move.

```ts
export const TEMPLATE_FORMAT_VERSION = 2;
/** Accepted on read. Absent means 1. */
export const SUPPORTED_FORMAT_VERSIONS = [1, 2] as const;

export interface SlotData {
  id: string; name: string;
  x: number; y: number; width: number; height: number;
  zIndex: number; color: string;
  /** REQ-002 Req 15. Absent in a v1 file -> parseTemplateFile fills in `true`. */
  required: boolean;
}

// ---- image:pick -----------------------------------------------------------
export interface PickImagesOptions {
  dialogTitle: string;
  fileTypeLabel: string;
  /** true -> the dialog allows multi-select (Req 4b); false -> exactly one file. */
  multiple: boolean;
}
export interface PickedImage {
  filePath: string;
  /** Basename, for display only. Never parsed, never used as an identity. */
  fileName: string;
  mimeType: 'image/jpeg' | 'image/png';
  /** Raw file bytes. The renderer wraps them in a Blob — never base64. */
  bytes: Uint8Array;
}
export type PickImagesResult =
  | { status: 'picked'; images: PickedImage[] }   // never empty
  | { status: 'canceled' }
  | { status: 'error'; code: 'READ_FAILED'; detail: string };

// ---- png:save -------------------------------------------------------------
export interface SavePngOptions {
  dialogTitle: string; fileTypeLabel: string; defaultFileName: string;
}
export type SavePngResult =
  | { status: 'saved'; filePath: string }
  | { status: 'canceled' }
  | { status: 'error'; code: 'INVALID_PAYLOAD' | 'WRITE_FAILED'; detail: string };
```

Preload gains exactly two methods; the two existing ones are unchanged:

```ts
window.api = {
  saveTemplate(template: TemplateFile, opts: SaveDialogOptions): Promise<SaveTemplateResult>;
  openTemplate(opts: OpenDialogOptions): Promise<OpenTemplateResult>;
  pickImages(opts: PickImagesOptions): Promise<PickImagesResult>;            // NEW
  savePng(bytes: Uint8Array, opts: SavePngOptions): Promise<SavePngResult>;  // NEW
};
```

Channels: `image:pick`, `png:save` (both `ipcRenderer.invoke`). No other channel exists
in this REQ.

**Main-side rules — `image:pick`** (`electron/ipc/image.ts`):

- `dialog.showOpenDialog` with `filters: [{ name: opts.fileTypeLabel, extensions:
  ['jpg', 'jpeg', 'png'] }]` and `properties: ['openFile']`, plus `'multiSelections'`
  when `opts.multiple` (Req 11: JPG/PNG only, and the picker must offer only those).
- Cancel, or an empty `filePaths`, → `{ status: 'canceled' }`.
- Each chosen file is read with `fs.readFile` (no encoding → a `Buffer`) and returned as
  `bytes`. `mimeType` is derived **from the extension only** — `.png` → `image/png`,
  `.jpg`/`.jpeg` → `image/jpeg`, **everything else → `image/jpeg`** (the two-way branch:
  `mimeType` has exactly two members, and this value is only a hint for the renderer's
  `Blob`). Main does **not** sniff or decode. Validation of image content happens once,
  in the one place that holds the bytes — see §6 "Decoding", **SA call B-10**, which is
  where Req 11 is actually enforced. *(An earlier wording here claimed a file that lies
  about its extension "fails to decode in the renderer". It does not — decoders sniff
  content, not the declared type. B-10 replaces that assumption with a real check; the
  reasoning is in TASK-005 §Review F.)*
- **Order is the dialog's order, preserved** — `result.filePaths` order is the order of
  `images`. Req 4b's matching runs off *slot* order, not photo order, but the photo
  order must still be stable and is the user's own selection order.
- Any throw → `{ status: 'error', code: 'READ_FAILED', detail }`. Partial failure is not
  a thing: if one of N files fails to read, the whole call is `READ_FAILED` and nothing
  is put into any slot. Simpler to reason about than a half-applied drop, and the user
  can retry. **SA call B-4.**

**Main-side rules — `png:save`:**

- `dialog.showSaveDialog` with `defaultPath = opts.defaultFileName` and
  `filters: [{ name: opts.fileTypeLabel, extensions: ['png'] }]`. Cancel →
  `{ status: 'canceled' }`, **nothing written** (B7).
- Extension is forced to `.png` if the user removed it — same rule as `.json`
  (SPEC-001 §4 `forceJsonExtension`).
- Defence in depth before writing (mirrors `isSaveablePayload`): `bytes` must be a
  `Uint8Array` with `length > 0` **and** start with the PNG magic
  `89 50 4E 47 0D 0A 1A 0A`. Failure → `INVALID_PAYLOAD`, nothing written.
- Any throw → `WRITE_FAILED`. Neither handler ever throws across the bridge, and neither
  logs user data.

**`detail` stays English and developer-facing** — logged with `console.error`, never
rendered. The renderer maps `code` to a §7 Thai key.

## 5. Cover-crop — one pure function, used by preview and by export

`src/lib/cover.ts`:

```ts
export interface SourceRect { sx: number; sy: number; sw: number; sh: number; }
/** The centred source rectangle of a `cover` fit. Pure arithmetic, no DOM. */
export function coverSourceRect(
  imgW: number, imgH: number, slotW: number, slotH: number,
): SourceRect;
```

Definition (Req 5): take the largest centred rectangle of the source image whose aspect
ratio equals the slot's, and stretch *that* onto the whole slot.

```
sw = min(imgW, imgH * slotW / slotH)
sh = min(imgH, imgW * slotH / slotW)
sx = (imgW - sw) / 2
sy = (imgH - sh) / 2
```

- No rounding: both consumers take floats. `drawImage(img, sx, sy, sw, sh, slotX, slotY,
  slotW, slotH)` and Konva's `crop={{x: sx, y: sy, width: sw, height: sh}}` with
  `width`/`height` = the slot take the same four numbers, so preview and PNG crop
  identically (B5).
- Guard: any of the four inputs `<= 0` or not finite → return
  `{ sx: 0, sy: 0, sw: 0, sh: 0 }` and the caller draws nothing. Slots with
  `width`/`height` `<= 0` are already rejected by `parseTemplateFile`, so this is only a
  defence against a zero-sized decoded image.
- Aspect ratio is preserved by construction and no letterboxing is possible, because the
  source rectangle is always fully inside the image and always exactly the slot's ratio.

## 6. Flow

### The mode shell

`mode.useTemplate.badge` stops being rendered and its key is **deleted** from §7 and from
`src/i18n/th.ts`; the Use Template button loses `disabled` / `aria-disabled` / the badge
`<span>` and gets `onClick={() => setMode('useTemplate')}` and the same
`aria-current` / active styling the designer entry has. `App.tsx` renders the designer
tree when `mode === 'designer'` and `<UseTemplateView />` when `mode === 'useTemplate'`.

**Switching modes destroys nothing.** Both stores are plain in-memory stores that live for
the app session: leaving Use Template and coming back finds the same template and the same
photos, and the designer is likewise untouched. **SA call B-5.**

### Pick a template (Req 2, 3, 10)

A `useTemplate.pickTemplate` button calls **the existing** `window.api.openTemplate` with
`dialog.open.title` + `dialog.fileTypeLabel` — the same channel, the same dialog, the
same strings as Load Template (B12). Then:

- `canceled` → no-op, the view is exactly as it was (B12).
- `error` → log `detail`, show `error.loadFailed`.
- `opened` → `parseTemplateFile(content)`; `!ok` → log `reason`, show
  `error.fileUnreadable`, **keep the current template and photos** (B10);
  `ok` → `normalizeTemplate(...)` (below) replaces the whole Use Template state, and
  **every photo already placed is dropped and its object URL revoked** — slot ids from a
  different file are meaningless.

`src/lib/template.ts` holds the two repairs SPEC-001 §3 puts on the renderer rather than
the validator, so both modes share one copy instead of two:

```ts
export function normalizeZIndex(slots: SlotData[]): SlotData[];   // moved out of designerStore
export function normalizeTemplate(t: TemplateFile): TemplateFile; // + trims name and slot names
```

`designerStore.replaceAll` is rewritten to call `normalizeTemplate`, and `designerStore`
imports `normalizeZIndex` from there. **This must be behaviour-preserving** — it is a
move, not a redesign; TASK-007's DoD carries the regression check.

### The preview (Req 3, 5)

`UseTemplateCanvas` is a Konva `Stage` sized `canvasWidth x canvasHeight`, scaled to fit
its pane, **capped at 1 exactly like the designer** (SPEC-001 §5). It is read-only: no
`draggable`, no `Transformer`, no `updateSlot`. Slots are drawn back-most first
(`slots` is kept sorted by `normalizeZIndex`), so overlap in the preview and in the PNG is
the designer's order (B6).

Per slot, in the same `<Layer>`:

- **empty** → a `Rect` with **no `fill`** (Req 3: a transparent rectangle),
  `stroke={slot.color}`, `strokeWidth` 1, `strokeScaleEnabled={false}`, plus the same
  name `Text` the designer uses (`listening={false}`, inset `6/scale`, `ellipsis`);
- **filled** → a Konva `Image` at the slot's `x`/`y`/`width`/`height` with
  `crop={coverSourceRect(...)}` and no name label — the photo is the label.

The stage background is a **white** `Rect`, the same as the designer's. It is preview
chrome only: Req 12's transparency is a property of the *file*, and B15 is checked on the
file. **SA call B-6** — inventing a checkerboard or any other "this is transparent"
affordance would be new UI nobody asked for.

### Photo in — one slot at a time (Req 4a)

Every row of `UseTemplateSlotPanel` (ordered **top-most first**, the reverse of the
store's back-most-first array — identical to `SlotListPanel`, which is what Req 4b's
"the order the on-screen slot list shows them" means) carries its own
`useTemplate.pickPhoto` button. It calls `pickImages({ multiple: false })`; on `picked`
the single image goes into **that** row's slot, replacing whatever was there (Req 13 /
B16) and revoking the replaced object URL.

### Photo in — several at once (Req 4b, 17)

A `useTemplate.pickManyPhotos` button in the Use Template toolbar calls
`pickImages({ multiple: true })` and hands the returned images to the store's
`fillFromPhotos(images)`. It is **rendered only when a template is loaded** — the same
condition the preview canvas and the current-template label already carry (**SA call
B-12**, added 2026-08-23; shipped by TASK-009 §0).

**Q-SA-1 is answered — (ก), *"เฉพาะช่องว่าง"*** (REQ-002 §Questions Q11, 2026-08-23). The
rule is now fixed and nothing here is open:

- `fillFromPhotos` walks the slots in **on-screen list order (top-most first)** and
  **skips every slot that already holds a photo**. A photo the user placed by hand is
  never overwritten by a multi-pick — replacing is a deliberate, per-slot act (Req 13).
- It consumes **one photo per empty slot**, in that order, until either the empty slots
  or the photos run out.
- **Surplus photos are discarded** and the call still succeeds (Req 17 / B21) — no
  exception, no refusal. "The slots that fit" means the **empty** ones, so the surplus is
  counted against those (Q11's second consequence).
- **Nothing is shown when photos are dropped** (REQ-002 Q10 = ก, *"ก"*): no notice, no
  count, no message. The `useTemplate.photosDropped` string drafted against that question
  is **not** shipped — see §7.
- The discarded photos **were** decoded (the whole batch is validated first — see
  "Decoding" below), so their object URLs exist and **must be revoked** as the fill ends.
  *(An earlier wording here said they "are never created in the first place". That was
  wrong: it contradicted the all-or-nothing batch decode of B-4. **SA call B-11.**)*

**Drag-and-drop is not a path in this REQ** (Q-SA-2 answered — *"dialog พอ"*, REQ-002
Q12): photos come in only through the native Open dialog, one slot at a time or
multi-select. It is now an explicit REQ-002 §Out of Scope bullet, so it cannot come back
as a surprise at acceptance.

### Decoding (both paths)

**First, the Req 11 gate — SA call B-10.** Before any `Blob` is made, the first bytes are
checked: a JPEG starts `FF D8 FF`, a PNG starts `89 50 4E 47 0D 0A 1A 0A`. Anything else
is **not** decoded and takes the decode-failure path below (`error.photoUnreadable`).
This is where "JPG/PNG only" is enforced, and it is the **only** place: the dialog filter
is a convenience the user can type past, `mimeType` is a hint and not a gate, and an
extension test in main cannot see a GIF renamed `photo.png`. Conversely a genuine JPEG
named `.gif` is accepted — Req 11 is about what the file *is*. Full reasoning and how it
was found: TASK-005 §Review F.

Then: `new Blob([bytes], { type: mimeType })` → `URL.createObjectURL` → `new Image()`;
`await` its `load`. On `error` (a file that is not really a JPG/PNG, or is damaged):
revoke the URL, put nothing in any slot, show `error.photoUnreadable`. On success the
store keeps `{ objectUrl, image: HTMLImageElement, fileName }` per slot.
**Every path that drops a photo — replace, remove, re-pick a template, surplus — revokes
its object URL.** Bytes are never turned into base64 and never into a data URL.

### Photo out (Req 16)

Each filled row also carries `useTemplate.removePhoto`. It clears the slot, revokes the
URL, and that is all: the preview shows the empty rectangle again, the PNG is transparent
there (Req 12), and if the slot is `required` the next Generate refuses (Req 14 / B20).

### Generate (Req 6, 7, 12, 14)

The button is **rendered only when a template is loaded** (**SA call B-13**, added
2026-08-23 ruling Fern's Q-FE-8 at TASK-009's review — the same `template &&` condition
B-12 puts on `useTemplate.pickManyPhotos`), and once rendered it is
**always enabled**. This is deliberately *not*
the Save-button pattern of REQ-001 A10: Req 14 says Generate **refuses with a Thai message
naming the problem**, and a disabled button cannot name anything. **SA call B-7.**

1. **Guard.** Collect the slots where `required` is true and no photo is placed. If that
   list is non-empty, show `error.requiredSlotEmpty` with `{slots}` replaced by their
   names joined with `, ` in on-screen list order, and stop — no dialog, no file (B17).
2. **Compose.** `composeTemplateToCanvas(template, photos)` in `src/lib/compose.ts`:
   create `document.createElement('canvas')`, set `width = canvasWidth`,
   `height = canvasHeight` (Req 6 / B4 — the on-screen scale is never involved), get
   `getContext('2d')`, **paint no background at all**, then for each slot back-most first
   that has a photo: `ctx.drawImage(img, sx, sy, sw, sh, slot.x, slot.y, slot.width,
   slot.height)` using §5. Empty slots and everything outside every slot are simply never
   drawn, which is exactly Req 12 / B15. Slots partly outside the canvas are clipped by
   the canvas itself — nothing to special-case (this is SPEC-001 §9 A-3's world).
3. **Encode.** `canvas.toBlob(cb, 'image/png')` → `await blob.arrayBuffer()` →
   `new Uint8Array(...)`. A null blob → log, show `error.exportFailed`, stop.
4. **Save.** `window.api.savePng(bytes, { dialogTitle: th['dialog.exportPng.title'],
   fileTypeLabel: th['dialog.pngTypeLabel'], defaultFileName: <template name> + '.png' })`.
   The name is already trimmed — it came through `normalizeTemplate`.
   `saved` → **nothing else happens; no confirmation** (SPEC-001 §9 A-5's precedent,
   confirmed by the human for the template save; extending it to the PNG is **SA call
   B-8**). `canceled` → no-op (B7). `error` → log `detail`, show `error.exportFailed`.

A template with **zero** slots is legal (`parseTemplateFile` accepts `slots: []`): no
required slot is empty, so Generate produces a fully transparent PNG of the right size.
The slot panel shows the existing `panel.empty` string. No new rule, no new key.

### Messages (all of Use Template)

One inline `role="alert"` line at the end of the Use Template toolbar, exactly the
placement and lifecycle SPEC-001 §5 fixed for the three I/O messages: cleared when the
next pick / generate starts, and when a new template is picked. Transient UI state only —
never stored, never saved.

### Dark mode (Req 9 / B9)

No new mechanism: the `dark` class is already on `<html>` and the new components use the
same Tailwind pairs the designer uses (`bg-white dark:bg-slate-900`, `text-slate-800
dark:text-slate-100`, `border-slate-200 dark:border-slate-700`, alert `text-red-600
dark:text-red-400`). The Konva stage is not themed — it shows the user's artwork.

## 7. Thai string table — **APPROVED 2026-08-23, all 18 strings**

REQ-002 Req 8 keeps REQ-001 Q9's loop: **I draft, the human approves through Porter,
nobody ships an unreviewed string.** That loop has now closed for this table: Q-SA-3 came
back *"อนุมัติหมด"* (REQ-002 §Questions **Q13**, 2026-08-23) — **all 18 strings below are
approved as drafted**, with no replacement wording and no exception. They are the shipped
wording, and criterion **B8** is checkable from here on.

What that approval does **not** cover, so nobody mistakes its reach: it is not a technical
approval — which keys exist, which are reused and which dead key is deleted stay my calls
(unchanged below) — and it covers only these 18. **Any string invented later comes back
through this same loop before it ships**, in a SPEC edit, an `@Porter` line and an answer
from the human. FE ships these values as written; a value nobody approved is a defect.

Conventions followed, all inherited from SPEC-001 §7 and already approved by the human:
**"ช่อง" for *slot***; buttons verb-first and short; retryable I/O errors end with
`กรุณาลองใหม่อีกครั้ง` and "this thing is wrong" messages do not; label-style, no final
full stop.

| key | Thai (approved) | state | English intent |
|-----|--------------|-------|----------------|
| `useTemplate.pickTemplate` | เลือกเทมเพลต | APPROVED | button: choose the template `.json` |
| `useTemplate.noTemplate` | ยังไม่ได้เลือกเทมเพลต | APPROVED | shown before any template is chosen |
| `useTemplate.currentTemplate` | เทมเพลตที่ใช้อยู่ | APPROVED | label in front of the loaded template's name |
| `useTemplate.pickPhoto` | เลือกรูป | APPROVED | per-row button: put one photo in this slot |
| `useTemplate.pickManyPhotos` | เลือกหลายรูป | APPROVED | toolbar button: fill slots from several photos at once |
| `useTemplate.removePhoto` | เอารูปออก | APPROVED | per-row button: take the photo back out |
| `useTemplate.slotEmpty` | ยังไม่มีรูป | APPROVED | marker on a row whose slot has no photo |
| `useTemplate.slotRequired` | ต้องใส่รูป | APPROVED | marker on a row whose slot is required |
| `useTemplate.generate` | สร้างภาพ | APPROVED | button: produce the finished PNG |
| `props.required` | ต้องใส่รูป | APPROVED | designer: checkbox label; checked = the slot is required |
| `dialog.pickPhotos.title` | เลือกไฟล์รูปภาพ | APPROVED | native Open dialog title for photos |
| `dialog.photoTypeLabel` | ไฟล์รูปภาพ (JPG, PNG) | APPROVED | file-type label for the JPG/PNG filter |
| `dialog.exportPng.title` | บันทึกไฟล์ภาพ | APPROVED | native Save dialog title for the PNG |
| `dialog.pngTypeLabel` | ไฟล์ภาพ (PNG) | APPROVED | file-type label for the PNG filter |
| `error.requiredSlotEmpty` | ยังมีช่องที่ต้องใส่รูปว่างอยู่: {slots} | APPROVED | Generate refused — names the empty required slots |
| `error.photoUnreadable` | ไฟล์รูปนี้ใช้งานไม่ได้ | APPROVED | the chosen file is not a usable JPG/PNG |
| `error.photoLoadFailed` | เปิดไฟล์รูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง | APPROVED | `image:pick` `READ_FAILED` |
| `error.exportFailed` | บันทึกไฟล์ภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง | APPROVED | `png:save` `WRITE_FAILED` / encode failed |

**Deleted:** `mode.useTemplate.badge` (*"ยังไม่พร้อมใช้งาน"*) — the mode is available now, so
the key becomes dead text. It is removed from `src/i18n/th.ts`, not left unused.
**Reused unchanged, no new key:** `mode.useTemplate`, `panel.slotsHeading`, `panel.empty`,
`toolbar.darkMode`, `dialog.open.title`, `dialog.fileTypeLabel`, `error.loadFailed`,
`error.fileUnreadable`.

**Not shipped — `useTemplate.photosDropped`.** REQ-002 **Q10** came back **ก**, *"say
nothing"* (REQ-002 §Questions Q10, 2026-08-23): surplus photos are dropped **silently**.
The 19th string drafted against that question — *"มีรูปเกินจำนวนช่อง {count} รูป ไม่ได้ใช้"* —
is therefore **not added** to `src/i18n/th.ts` at all, and no key, no logic and no
criterion moves. The table above is the complete set: **18 keys, no 19th.** (This is why
Q13's approval says 18 and not 19 — the dropped-photos notice was never put to him for
wording, only for existence, and it lost.)

**The one placeholder.** `error.requiredSlotEmpty` is now the **only** string carrying a
`{…}` placeholder (`{slots}`), filled by a single `String.replace` at render time — the
`{count}` one went with the unshipped notice above. `src/i18n/th.ts` stays a flat table of
plain strings (no functions, so `ThKey` typing is unchanged), and nothing branches on a
message's *text* — SPEC-001's rule is intact. **SA call B-9**, narrowed to one string.

## 8. Non-functional

- Unchanged from SPEC-001 §6: no network calls anywhere; `npm run typecheck` passes with
  `strict: true` and no `any` on the seam; `npm run build` exit 0.
- **No photo size or count limit is imposed** — REQ-002 asks for none, and inventing one
  would need a Thai message and a stakeholder round. Memory is kept sane by construction
  instead: bytes cross the seam as `Uint8Array` (never base64, which would inflate every
  photo by a third), each photo is held as one `Blob` object URL plus one decoded
  `HTMLImageElement`, and every drop path revokes its URL. **SA call B-3**, and the
  honest limit is stated rather than hidden: a very large canvas (§9 A-2 of SPEC-001
  allows up to 10000x10000) times a dozen large photos can still exhaust renderer memory,
  and this REQ does nothing about that.
- No installer / packaging work (still out of scope). SPEC-001 A-7's CSP and A-10's
  dev-server advisory are unchanged and still land with packaging.
- `package.json` must NOT gain `"type": "module"` — SPEC-001 §9's standing build
  constraint, restated because TASK-005 touches the electron side.

## 9. SA technical calls (this SPEC) — B-1 … B-13

- **B-1.** `formatVersion` is written as **2**; **absent, 1 and 2** are accepted on read.
  Absent/1 means "no `required` field", which `parseTemplateFile` fills in as `true`.
  This is what SPEC-001 §3 reserved the field for. *(SPEC-001 §3's "any other value is
  rejected" is superseded by this line and nothing else.)*
- **B-2.** The JSON field is named **`required`** (boolean, `true` = must have a photo),
  not `optional`. Reason: Req 15d makes **required** the default for a new slot and Req
  15c makes it the default for an old file, and a boolean whose default is `true` reads
  better than one whose default is `false` — and `"required": false` is unambiguous where
  `"optional": false` invites a double negative. REQ-002 Q7 explicitly left the field
  name to me.
- **B-3.** No photo size / count limit; memory managed by `Uint8Array` + object URLs +
  disciplined revocation (§8).
- **B-4.** `image:pick` is all-or-nothing: one unreadable file fails the whole call with
  `READ_FAILED` and nothing is placed.
- **B-5.** Switching modes preserves both stores for the app session.
- **B-6.** The Use Template preview keeps the designer's **white** stage background; no
  transparency affordance is invented. Req 12 / B15 are properties of the file.
- **B-7.** Generate is **always enabled** once a template is loaded and refuses with a
  message — not the disabled-button pattern of REQ-001 A10, because Req 14 requires a
  message that names the problem.
- **B-8.** A successful Generate shows **no** confirmation, extending SPEC-001 §9 A-5
  (which the human confirmed for the template save) to the PNG.
- **B-9.** Two §7 strings carry a `{…}` placeholder filled by one `String.replace`;
  `th.ts` stays a flat string table. *(Amended 2026-08-23 at TASK-010's review, the N-SA-6
  fix.)* That `replace` is written in its **replacer-function** form —
  `.replace('{slots}', () => value)` — because a *string* replacement is scanned for `$`
  patterns (`$&`, `$$`, `$'`, ``$` ``) and a slot name may legally contain them. Any future
  placeholder fill uses the same form; it is still one `replace` at render time and nothing
  branches on a message's text. Verified in TASK-010 §Review B/C.
- **B-10** *(added 2026-08-23, out of TASK-005's review — see its §Review F).* **Req 11
  is enforced on the bytes, in the renderer, by magic number** (`FF D8 FF` / the PNG
  signature), immediately before decoding; a failure reuses `error.photoUnreadable`.
  Not in main, not by extension, not by `mimeType`. Costs no channel, no result variant
  and no new Thai string. A real JPEG with the wrong extension is accepted — Req 11 is
  about the file, not its name.
- **B-11** *(added 2026-08-23 while transcribing Q11 — it corrects **my own** §6, not
  anyone's code; nothing is built yet).* In a multi-pick, **the whole batch is gated and
  decoded before any of it is placed**, surplus photos included, and the object URLs of
  the photos that end up unused are **revoked as the fill ends**. §6 previously claimed
  those URLs "are never created in the first place", which contradicted B-4's
  all-or-nothing batch rule and would have made TASK-008's "never leaks an object URL"
  unverifiable. Two consequences, stated so neither is a surprise:
  - a photo among the **surplus** that fails the B-10 gate or fails to decode fails the
    **whole** drop — nothing is placed, every URL of that batch is revoked, and
    `error.photoUnreadable` shows. That is B-4's rule applied consistently: the batch is
    validated as a unit before any of it is used.
  - Req 17's *"the app carries on"* still holds for the ordinary case, which is the one
    it was written about: surplus photos that are **fine** are dropped silently.
  This edge (a corrupt file *inside* the surplus) is reachable but narrow, and neither
  Req 11 nor Req 17 reaches it, so it went to Porter as **Q-SA-5** — **answered
  2026-08-23, *"ล้มทั้งชุด"*: the whole drop fails, confirming this call unchanged.**
  Record in REQ-002 §Questions Q16, transcription in §11.
- **B-12** *(added 2026-08-23, ruling Fern's `Q-FE-5` at TASK-008's review).* The
  `useTemplate.pickManyPhotos` button is **rendered only when a template is loaded** —
  the same condition the preview canvas and the `useTemplate.currentTemplate` label
  already carry. Without a template every picked photo is surplus and Q10 = ก forbids
  saying so, so the button would open a dialog and then, correctly, do nothing visible.
  Hiding beats disabling here by **B-7**'s own logic: B-7 refuses to disable Generate
  *because a disabled button cannot name its reason*, and this one cannot name one
  either. No string, no requirement, no criterion moves. It is one condition in
  `UseTemplateView`'s toolbar and it is folded into **TASK-009 §0** rather than a rework
  hop for TASK-008, exactly as N-SA-3 was folded into TASK-008 §0.
- **B-13** *(added 2026-08-23, ruling Fern's `Q-FE-8` at TASK-009's review).* The
  `useTemplate.generate` button is **rendered only when a template is loaded** — the same
  `template &&` condition B-12 just put on `useTemplate.pickManyPhotos`, and the one the
  preview canvas and the `useTemplate.currentTemplate` label already carried. §6's *"always
  enabled"* was written about a **loaded** template and never said what the toolbar shows
  before one; the three readings Fern set out are in TASK-009 §Questions. Hiding wins for
  B-12's reason, unchanged: with no template Generate can do nothing visible, and B-7
  refuses the *disabled* variant precisely because a disabled button cannot name its
  reason — this one cannot name one either. It also leaves `handleGenerate` with no
  unspecified path. **Built this way already**, so it costs nothing: no string, no store
  field, no requirement and no criterion moves. Consequence for acceptance, stated so it
  is not a surprise on the human's screen: before a template is picked the Use Template
  toolbar offers exactly **one** button, `เลือกเทมเพลต`.

## 10. Tasks

| id | title | owner | depends on |
|----|-------|-------|-----------|
| TASK-005 | Contract v2 + `image:pick` / `png:save` handlers + preload | **Jason (BE)** | — |
| TASK-006 | Designer: per-slot required/optional, saved and loaded | **Fern (FE)** | TASK-005 |
| TASK-007 | Use Template shell: enable the mode, pick a template, preview | **Fern (FE)** | TASK-005 |
| TASK-008 | Photos into slots: one at a time, several at once, replace, remove | **Fern (FE)** | TASK-007 |
| TASK-009 | Generate: compose at full resolution and save the PNG | **Fern (FE)** | TASK-006, TASK-008 |
| TASK-010 | Refusal message must render slot names literally (N-SA-6 defect fix) | **Fern (FE)** | — |

**Nothing in this SPEC is blocked, and every TASK is now `DONE`** — TASK-005 … TASK-009
accepted 2026-08-23, **TASK-010 accepted 2026-08-23** (verdict and evidence in TASK-010
§Review; B-9 above carries the rule it leaves behind). **TASK-010 was added 2026-08-23** on
the human's Q22 go-ahead (*"แก้เลย"*):
it repairs one refusal message this SPEC already specified (§7 / SA call **B-9**) and
changes **no** requirement, **no** acceptance criterion and **no** §7 string — so
REQ-002's acceptance pass stands on its own evidence and is not gated on it here.
Whether `DELIVERED` waits for TASK-010 is **Porter's ruling**, not this SPEC's.

## 11. Questions

**Q-SA-1 → Porter — ANSWERED 2026-08-23: (ก), *"เฉพาะช่องว่าง"*.** Recorded by Porter in
REQ-002 §Questions **Q11**, which is the record; this is the transcription into the
design. A multi-pick fills **only the empty slots**, top-most first; a slot filled by hand
is never overwritten; "the slots that fit" (Req 17) means the **empty** ones, so surplus
is counted against those. Written into §6 "Photo in — several at once" and into TASK-008
§2; **TASK-008 is unblocked.** Reading (ข) is dead. *The question as it was put:*
**When several photos are brought in at once, do they fill only the *empty* slots, or do
they fill from the top of the list and overwrite photos that are already there?**
REQ-002 Req 4b and Req 17 both say the photos are matched to slots "in the order the
on-screen slot list shows them", but neither says what happens to a slot that already
holds a photo, and Q2 / Q9 did not reach it. The two readings give visibly different
results and I will not pick one:

- **(ก) Skip filled slots** — the photos land in the empty slots only, top-most first;
  a slot the user has already filled by hand is never disturbed. "The slots that fit"
  (Req 17) then means the *empty* ones, so surplus is counted against those.
- **(ข) Fill from the top, overwriting** — the first photo goes into the top-most slot
  whatever is in it, the second into the next, and so on; "the slots that fit" means all
  of them. A multi-pick is then a way to redo the whole template in one go.

Both are consistent with everything he has answered; (ก) protects hand-placed work, (ข)
is more predictable to describe. **No recommendation is worth much here — it is a
preference about his own habit, so it is his call, not mine.** Answer shape: "ก" or "ข".
Nothing else in REQ-002 moves either way; TASK-005 / 006 / 007 / 009 are unaffected.
*(He answered in his own words rather than by letter, and Porter recorded that (ก) is
what the words reach — I take the letter from Porter's reading, not from my own.)*

**Q-SA-2 → Porter — ANSWERED 2026-08-23: *"dialog พอ"*** (REQ-002 §Questions **Q12**).
The specced multi-select stands and **drag-and-drop is not wanted here** — Porter has put
it in REQ-002 §Out of Scope, so it cannot resurface at acceptance. It reaches "not in this
REQ", not "never". §6 says so explicitly now. *The FYI as it was put:*
Req 4b says photos are "brought in at once". I have specced that as **multi-select in the
same kind of native Open dialog** the app already uses everywhere (§6), because that is
the pattern Q1 chose for templates and it needs no new mechanism. **Drag-and-drop from
Explorer onto the window is not in REQ-002 and I have not specced it.** If the human
pictured dragging files in, that is a real scope addition and he should say so now rather
than at acceptance — it is a different input path, not a different button.

**Q-SA-3 → Porter — ANSWERED 2026-08-23: *"อนุมัติหมด"*** (REQ-002 §Questions **Q13**).
**All 18 strings of §7 are approved as drafted** — no replacement wording, no exception.
§7's heading and every row now say APPROVED, and **B8 is checkable**. The approval does
not reach any string outside those 18: the surplus-photos notice is not shipped at all
(Q10 = ก) and any string invented later comes back through this loop first. Which keys
exist, which are reused and which dead key is deleted stay my calls. *The request as it
was put:*
**All 18 new Thai strings in §7 are DRAFT** and Req 8 keeps approval with the human. The
table is ready to take to him as-is; the drafting rationale is §7's conventions
paragraph. Same answer shape as REQ-001 Q9: "approved", or replacements. FE builds
against the keys meanwhile, exactly as it did in REQ-001, so this blocks no task — only
criterion **B8** and the delivery of REQ-002.

**Q-SA-4 → Porter — CLOSED 2026-08-23 by REQ-002 Q10 = ก.** The app says **nothing** when
surplus photos are dropped, so the 19th string is not added and §7 stays at 18 keys. This
question existed only to keep Q10 and the string table tied together; both are settled.

**Q-SA-5 → Porter — ANSWERED 2026-08-23: *"ล้มทั้งชุด"* — the whole drop fails, as
specced.** Recorded by Porter in REQ-002 §Questions **Q16**, which is the record; this is
the transcription into the design. It **confirms B-11 / B-4** and therefore changes
nothing: §6 "Photo in — several at once" and §9 B-11 already say the batch is gated and
decoded as a unit, that a bad photo anywhere in it — surplus included — places nothing and
shows `error.photoUnreadable`, and that every object URL of that batch is revoked. **No
requirement, no criterion, no string, no channel and no TASK moves**; the reverse reading
("fill what is good") is dead, and the condition it would have needed in `fillFromPhotos`
is not written. TASK-008 stands exactly as it is. *The question as it was put:*
**A multi-pick where one of the *surplus* photos is corrupt or is not really a JPG/PNG:
should the whole drop fail, or should the good photos still go in?** I have ruled it the
first way (**B-11**, §9) because it is B-4's existing all-or-nothing rule applied
consistently — the batch is validated as a unit before any of it is used — and because
"some of what you picked was broken" is worth showing rather than swallowing. But I want
it on the record rather than buried: Req 11 (*a bad file is refused*) and Req 17 (*surplus
is dropped and the app carries on*) both touch this and neither reaches it, so which one
wins is arguably his preference, not my arithmetic.

What it costs to reverse: one condition in `fillFromPhotos` and one DoD line in TASK-008 —
gate/decode only as many photos as there are empty slots, and drop the rest unexamined.
**No Thai string, no channel, no criterion moves either way**, which is why it does not
block. Answer shape: "fail the whole drop" (as specced) or "fill what is good".
*Not urgent — it can be answered any time before TASK-008 is reviewed.*

**No DATA REQUEST.** This REQ touches no database, no server and no third-party API;
everything it needs is the file format this team wrote and the human's own photos, which
he supplies at acceptance by using the app. Nothing here needs the human to run anything.

*(Jason and Fern: ask here as `Q-BE-n` / `Q-FE-n`; I answer as `> answer: ...`.)*
