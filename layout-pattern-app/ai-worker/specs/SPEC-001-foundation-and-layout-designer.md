# SPEC-001: Project foundation + Layout Designer
- Source: REQ-001
- Status: ACTIVE
- Author: Sober (SA) — 2026-08-22

## 1. Overview

Greenfield Electron desktop app in one repo (`H:\layout-pattern-app\layout-pattern-app`).
Electron main + preload are built by Vite alongside the React renderer
(`vite-plugin-electron`), which gives the standard `electron/` + `src/` layout the
PROTOCOL ownership split already assumes: **Jason owns `electron/`, `shared/`, build
config; Fern owns `src/`**. State lives in Zustand, the canvas is Konva/react-konva,
styling is Tailwind with a `dark` class on `<html>`.

Design principle for the seam: **all Thai user-facing text lives in the renderer**
(Fern). The main process never contains a user-facing string — native dialog titles
and file-type labels are passed *into* the IPC call by the renderer, and errors come
back as machine codes that the renderer maps to Thai. This keeps one language home
and lets Jason work independently of the Thai wording (§7 — all 27 keys approved
2026-08-22).

Scope is REQ-001 only. Use Template is a visible, disabled entry point (A6).

## 2. Repository layout

```
layout-pattern-app/
├─ package.json                 scripts: dev, build, typecheck
├─ vite.config.ts               react + vite-plugin-electron (main, preload)
├─ tsconfig.json                path aliases @/* -> src/*, @shared/* -> shared/*
├─ tsconfig.node.json
├─ tailwind.config.js           darkMode: 'class'
├─ index.html                   renderer entry
├─ electron/
│  ├─ main.ts                   BrowserWindow, app lifecycle
│  ├─ preload.ts                contextBridge -> window.api
│  └─ ipc/template.ts           save/open handlers
├─ shared/
│  └─ contract.ts               types + validator shared by both sides (see §4)
└─ src/
   ├─ main.tsx, App.tsx
   ├─ components/               AppShell, DesignerCanvas, SlotRect, SlotListPanel,
   │                            SlotPropertiesPanel, Toolbar
   ├─ store/designerStore.ts    Zustand
   ├─ store/uiStore.ts          theme + active mode
   └─ i18n/th.ts                the ONLY place Thai strings exist (see §7)
```

`UseTemplatePlaceholder` was listed here in the first draft and is **removed 2026-08-22**
(TASK-004 Q-FE-7): §5 makes the Use Template entry `disabled`, so `mode` can never become
`useTemplate` in REQ-001 and the component would be unreachable dead code. My listing
error, not an FE omission. The `useTemplate` member of the `AppMode` union **stays** — the
shell must stay honest that a second mode exists. The component belongs to the Use
Template requirement, whenever Porter writes it.

`shared/contract.ts` is the seam artifact. It is created by Jason (TASK-002) exactly
as specified in §4 and is then **read-only for Fern** — if the renderer needs a field
or channel that is not in it, that is a `## Questions` entry to Sober, never a local
edit and never a new channel.

Electron security: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
The renderer has no `fs` and no `require`; everything filesystem-related crosses §4.

## 3. Data model — template JSON

Written UTF-8, 2-space indented, extension forced to `.json`.

```json
{
  "formatVersion": 1,
  "name": "my-template",
  "canvasWidth": 1080,
  "canvasHeight": 1920,
  "slots": [
    { "id": "b1f0…", "name": "slot 1", "x": 40, "y": 40,
      "width": 300, "height": 300, "zIndex": 0, "color": "#4f8ef7" }
  ]
}
```

- `id` — `crypto.randomUUID()`, stable for the slot's lifetime, unique inside a file.
- `name` — free text, unique inside one template (REQ 5.3 / A8). Default `slot N` (English).
- `x`, `y`, `width`, `height` — numbers in canvas pixels, rounded to integers on save.
- `zIndex` — integer, contiguous `0 … slots.length-1`, `0` = back-most. Array order in
  the file is not authoritative; `zIndex` is.
- `color` — opaque hex `#rrggbb`, lower-case (SA call; a full picker is required by
  REQ 5.4 but no alpha is asked for anywhere).
- `formatVersion` — written as `1`; on load an absent value is treated as `1`, any
  other value is rejected as an unreadable file. Cheap guard so REQ-002 can evolve
  the shape without silently misreading old files. **Superseded 2026-08-23 —
  SPEC-002 §3 / §9 B-1** raises the written value to `2` and accepts absent/`1`/`2`,
  which is exactly what this guard was kept for. Nothing else in §3 moves.
- The written file ends with a **trailing newline** after the closing brace — POSIX
  convention, round-trips unchanged. Recorded 2026-08-22 from TASK-002 Q-BE-7.

### What a loaded file must satisfy

Enforced in exactly one place, `parseTemplateFile` (§4). Ruling recorded as §9 **A-11**,
2026-08-22, answering TASK-002 Q-BE-6. A file is **rejected as unreadable** when it breaks
an invariant this app's own UI can never produce:

- template `name` blank or whitespace-only — main refuses to *write* one
  (`INVALID_PAYLOAD`, §4) and REQ-001 A10 disables Save, so accepting one would load a
  template that can never be saved again;
- a slot `name` blank or whitespace-only — §5 refuses exactly that rename (A15). Checked
  **before** the duplicate-name check, same order as §5;
- two slots sharing an `id` — the uniqueness this section already states; the store keys
  selection, patch and delete by `id`, so a duplicate silently acts on the wrong slot;
- a slot `width` or `height` that is not `> 0`. This is **not** the 20x20 floor of §5 —
  that floor is a Transformer interaction limit, not a file invariant.

`zIndex` is the one invariant above **not** enforced on read: a file whose `zIndex` values
are duplicated or non-contiguous is **accepted**, and the renderer re-indexes it on load
with the `normalizeZIndex` it already has (TASK-004). "Contiguous `0 … n-1`" therefore
describes what the app *writes*, not a precondition of what it *reads*.

Padded names are the second thing repaired on read rather than rejected: a hand-edited
file whose template `name` or a slot `name` carries leading/trailing whitespace is
**accepted**, and the renderer's `replaceAll` stores every name **trimmed** (TASK-004),
so a loaded name matches what §5's rename path would have produced. Recorded 2026-08-22
at TASK-002's round-2 review (§Review N5). A name that is *only* whitespace is a
different case and is still rejected above — trimming can therefore never empty a name.

## 4. The IPC seam (owned by Sober — do not extend without a SPEC change)

`shared/contract.ts`:

```ts
export const TEMPLATE_FORMAT_VERSION = 1;

export interface SlotData {
  id: string; name: string;
  x: number; y: number; width: number; height: number;
  zIndex: number; color: string;
}

export interface TemplateFile {
  formatVersion: number; name: string;
  canvasWidth: number; canvasHeight: number;
  slots: SlotData[];
}

/** Renderer supplies every user-facing string; main contains none. */
export interface SaveDialogOptions {
  dialogTitle: string; fileTypeLabel: string; defaultFileName: string;
}
export interface OpenDialogOptions {
  dialogTitle: string; fileTypeLabel: string;
}

export type SaveTemplateResult =
  | { status: 'saved'; filePath: string }
  | { status: 'canceled' }
  | { status: 'error'; code: 'INVALID_PAYLOAD' | 'WRITE_FAILED'; detail: string };

export type OpenTemplateResult =
  | { status: 'opened'; filePath: string; content: string }
  | { status: 'canceled' }
  | { status: 'error'; code: 'READ_FAILED'; detail: string };

/** Pure, no I/O — used by the renderer after openTemplate returns raw text. */
export type ParseResult =
  | { ok: true; template: TemplateFile }
  | { ok: false; reason: string };
export function parseTemplateFile(raw: string): ParseResult;
```

`detail` and `reason` are **English, developer-facing only** — they are logged, never
rendered. The renderer maps `code` to a Thai string from §7.

Preload exposes exactly:

```ts
window.api = {
  saveTemplate(template: TemplateFile, opts: SaveDialogOptions): Promise<SaveTemplateResult>;
  openTemplate(opts: OpenDialogOptions): Promise<OpenTemplateResult>;
};
```

Channels: `template:save`, `template:open` (both `ipcRenderer.invoke`). No other
channel exists in this REQ.

Main-side rules:
- `saveTemplate` shows `dialog.showSaveDialog` with the JSON filter built from
  `fileTypeLabel` + `['json']` and `defaultPath = defaultFileName`. Cancel →
  `{ status: 'canceled' }`. It forces a `.json` extension if the user removed it.
- Before writing, main guards `typeof template.name === 'string' && template.name.trim() !== ''`
  and `Array.isArray(template.slots)`; failure → `INVALID_PAYLOAD`, nothing written.
  This is defence in depth behind the disabled button of REQ 14 — the UI must still
  never send an empty name.
- `openTemplate` shows `dialog.showOpenDialog` (single file, JSON filter) and returns
  the file's raw UTF-8 text. **Main does not parse or validate JSON** — the renderer
  calls `parseTemplateFile`, so validation exists once.
- Both handlers catch all errors and return the error variant; they never throw
  across the bridge and never `console.log` user data.

## 5. Flow

**Add slot** — new slot: 300x300 (clamped to the canvas if the canvas is smaller),
placed at `(40 + 32*k, 40 + 32*k)` where `k = slots.length mod 10`, `zIndex` = top,
`color` = next entry of a 8-colour rotation, `name` = **the lowest `slot N`, starting at
1, not already in use** — "in use" under the same case-insensitive rule as the rename
check (§9 A-6), so with a slot the user renamed to `Slot 3` present, the generator skips
3. This is no longer an SA assumption: the human confirmed it 2026-08-22 (REQ-001 Q17)
and it is now **criterion A17**. It settles only which *number* a new slot gets — the
default name stays English (REQ-001 Q6) and is not a §7 key.
Selected on creation.

**Move / resize** — Konva `Transformer` on the selected slot: 8 handles, **rotation
disabled** (out of scope), free aspect ratio, minimum 20x20. Scale is baked back into
`width`/`height` on transform end (`scaleX/Y` reset to 1) so the stored model never
carries a scale factor. Positions are not clamped to the canvas (see §9 A-3).

**Rename** — in the properties panel (`props.name` input). The new name is **committed
on Enter or on blur**, not on every keystroke, so a half-typed collision never nags.
On commit the store trims the value and compares it to every *other* slot's name in the
same template **case-insensitively** on the trimmed value — `a.trim().toLowerCase() ===
b.trim().toLowerCase()` (§9 A-6, the human vetoed the case-sensitive reading). The name is
**stored with the casing the user typed**, and **stored trimmed** — the surrounding
whitespace is dropped at the boundary, so `"  slot 9  "` becomes `"slot 9"` in the store
and in the saved file (TASK-003 Q-FE-2, confirmed 2026-08-22; only the *casing* is
preserved verbatim, never the padding). Only the comparison folds case:

- unique → the rename is applied;
- collides with another slot's name under that comparison → **the rename is refused**: the store keeps the old
  name, the input reverts to it, the other slot is untouched, and the renderer shows
  the Thai warning `error.duplicateSlotName` (§7) — REQ-001 Requirement 15 / A11.
  Placement is an SA design call: inline text directly under the name input, styled as
  an error, `role="alert"`, cleared as soon as the user edits the field again or selects
  another slot. It is transient UI state only — nothing about it is stored or saved.
- blank / whitespace-only (`name.trim() === ''`) → **the rename is refused *and*
  warned** — REQ-001 Requirement 16 / A15, the human answered Q13 *"ขึ้นข้อความเตือน
  ไทยด้วย"* on 2026-08-22, so the earlier provisional wordless refusal is gone. Behaviour
  is identical to the duplicate branch above — the store keeps the old name, the input
  reverts to it — except the message shown is `error.blankSlotName` (§7). Same
  placement, same `role="alert"`, same clearing rule, same transient-only state.
  The blank check runs **before** the duplicate check, so an empty field never reports
  a collision. The §7 row for this key has been **APPROVED** since 2026-08-22
  (REQ-001 Q18), so both the behaviour and the Thai wording are final.

**Colour** — full picker (`<input type="color">` is sufficient and needs no library),
value stored as `#rrggbb`.

**Z-order** — side panel is listed top-most first; "bring forward" / "send backward"
swap `zIndex` with the neighbour and the store re-normalises to `0…n-1`.

**Delete** — from the side list; remaining `zIndex` values re-normalise; selection clears
**whether or not the deleted slot was the selected one** (TASK-003 Q-FE-3, confirmed
2026-08-22 — the unconditional reading is the binding one).

**Canvas size** — two integer inputs, default 1080 x 1920, accepted range 1…10000
(SA guard). Changing the size does not move or clamp existing slots.
The stage is drawn **scaled to fit** its pane while the model keeps true canvas pixels,
and that fit-scale is **capped at 1 — it never magnifies**: a canvas smaller than the
pane is drawn 1:1 rather than blown up, so what the user sees is always the pixels he is
designing in (TASK-003 Q-FE-4, confirmed 2026-08-22).

**Save** — Save control is disabled while `templateName.trim() === ''` (REQ 14 / A10):
`disabled` attribute + a visibly muted style, no message, no dialog. Otherwise the
store serialises to `TemplateFile` (integers rounded, `zIndex` normalised) and calls
`window.api.saveTemplate` with `defaultFileName = <templateName.trim()>.json`.
`saved` → nothing else happens (no toast — none is specified). `canceled` → no-op.
`error` → Thai message from §7.

**The template name is trimmed at the save boundary, in both places it leaves the app** —
`toTemplateFile()` writes `name: templateName.trim()` and `defaultFileName` uses the
trimmed value too (added 2026-08-22, TASK-004 **Q-FE-5**, my omission). It is **not**
trimmed in `setTemplateName`: that fires per keystroke and would make a space untypeable.
Reason it is not optional: the load path already trims (below), so an untrimmed save makes
save → load → save produce a *different* file for the same design, i.e. the app renames
the user's template behind his back exactly once. This is the same rule the human already
approved for slot names ("Rename" above) applied to the one name that escaped it.

**Load** — `window.api.openTemplate` → `canceled` no-op; `opened` → `parseTemplateFile`
→ `ok` replaces the whole designer state (canvas size, template name, slots, selection
cleared) → `!ok` shows the Thai "unreadable file" message and leaves current state
untouched. Loading never merges.

**The three I/O messages** (`error.saveFailed`, `error.loadFailed`, `error.fileUnreadable`)
follow the rename warnings' pattern, written down 2026-08-22 (TASK-004 **Q-FE-6**) so it
stops being an unwritten precedent: one inline `role="alert"` line on its own row at the
end of the toolbar; cleared when the next save or load starts and when the template-name
field is edited; **not** cleared by canvas-size edits or by anything in the canvas, since
neither retries nor invalidates the last file operation. Transient UI state only — never
stored, never saved. The English `detail` / `reason` is `console.error`-ed, never rendered.

**Modes** — a two-entry top bar: Layout Designer (active) and Use Template (visibly
disabled, marked not-available; clicking does nothing and cannot crash — A6).

**Dark mode** — toggle in the top bar, `dark` class on `<html>`, in-memory only
(persistence is not requested).

## 6. Non-functional

- Only the app's own local files are touched. No network calls anywhere.
- `npm run typecheck` must pass with `strict: true`; no `any` on the seam types.
- Run instructions live in `README.md` and must be sufficient from a clean checkout
  (A5): install, dev, build.
- No installer/packaging work in this REQ (out of scope).

## 7. Thai string table — **all 27 keys APPROVED 2026-08-22**

Requirement 12 puts every on-screen string in Thai. Under REQ-001 Q9 the human
delegated the *drafting* to Sober ("ให้ Sober ตั้งคำไทยมาก่อน แล้วผมรีวิว") and kept
approval for himself.

**Approval state (two different things — read the `state` column of every row before
you copy it):**

- **Rows marked `APPROVED`** — the 26 keys the human approved verbatim on 2026-08-22
  (*"อนุมัติหมด"*, REQ-001 §Questions Q9, mirrored here as Porter asked). No per-key
  correction, and the "ช่อง"-for-*slot* choice was explicitly included. These values are
  **final wording** and are what acceptance criterion A16 is checked against. Changing
  any of them is a new stakeholder question through Porter, never an edit here.
- **No row is `DRAFT` any more.** The 27th key, `error.blankSlotName`, was created by
  REQ-001 Q13 / Requirement 16 (the blank-name warning) *after* the 26-key approval and
  so fell outside it. Porter put it to the human on 2026-08-22 and he approved the
  drafted wording unchanged — *"Q17=ก"*, i.e. option (ก), recorded in REQ-001
  §Questions **Q18**. Its row now reads `APPROVED` like the other 26, A16 covers the
  whole table, and §9 **Q-SA-4 is CLOSED**. Mirrored here 2026-08-22 as Porter asked.

`src/i18n/th.ts` exports one flat object with exactly these keys. The keys are fixed by
this SPEC and are **not** review material — only the Thai values are. A value the human
corrects changes in `src/i18n/th.ts` alone, never in logic, which is why FE may build
against the draft key now, exactly as it already builds against the approved 26
(§8: TASK-003/004 unblocked 2026-08-22).

| key | Thai | state | English intent |
|-----|------|-------|----------------|
| `app.windowTitle` | โปรแกรมออกแบบเลย์เอาต์ภาพ | APPROVED | application window title |
| `mode.designer` | ออกแบบเลย์เอาต์ | APPROVED | tab: Layout Designer |
| `mode.useTemplate` | ใช้เทมเพลต | APPROVED | tab: Use Template |
| `mode.useTemplate.badge` | ยังไม่พร้อมใช้งาน | APPROVED | short "not available yet" marker on that tab |
| `toolbar.templateName` | ชื่อเทมเพลต | APPROVED | label of the template-name input |
| `toolbar.canvasWidth` | ความกว้าง (px) | APPROVED | label: canvas width |
| `toolbar.canvasHeight` | ความสูง (px) | APPROVED | label: canvas height |
| `toolbar.addSlot` | เพิ่มช่อง | APPROVED | button: add a slot |
| `toolbar.save` | บันทึกเทมเพลต | APPROVED | button: save template |
| `toolbar.load` | เปิดเทมเพลต | APPROVED | button: load template |
| `toolbar.darkMode` | โหมดมืด | APPROVED | label of the dark-mode toggle |
| `panel.slotsHeading` | รายการช่อง | APPROVED | heading of the slot list |
| `panel.empty` | ยังไม่มีช่องในเลย์เอาต์ | APPROVED | text shown when there are no slots yet |
| `panel.bringForward` | เลื่อนขึ้นหน้า | APPROVED | button/tooltip: bring slot forward |
| `panel.sendBackward` | เลื่อนลงหลัง | APPROVED | button/tooltip: send slot backward |
| `panel.delete` | ลบช่อง | APPROVED | button/tooltip: delete slot |
| `props.heading` | คุณสมบัติช่อง | APPROVED | heading of the slot properties panel |
| `props.name` | ชื่อช่อง | APPROVED | label: slot name |
| `props.color` | สีช่อง | APPROVED | label: slot colour |
| `dialog.save.title` | บันทึกไฟล์เทมเพลต | APPROVED | native Save dialog title |
| `dialog.open.title` | เปิดไฟล์เทมเพลต | APPROVED | native Open dialog title |
| `dialog.fileTypeLabel` | ไฟล์เทมเพลต (JSON) | APPROVED | file-type label for the JSON filter |
| `error.saveFailed` | บันทึกไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง | APPROVED | writing the file failed (`WRITE_FAILED`) |
| `error.loadFailed` | เปิดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง | APPROVED | reading the file failed (`READ_FAILED`) |
| `error.fileUnreadable` | ไฟล์นี้ไม่ใช่ไฟล์เทมเพลตที่ใช้งานได้ | APPROVED | the chosen file is not a valid template |
| `error.duplicateSlotName` | มีช่องที่ใช้ชื่อนี้อยู่แล้ว กรุณาตั้งชื่ออื่น | APPROVED | duplicate-rename warning (REQ-001 Q11 / Req 15 / A11) |
| `error.blankSlotName` | ชื่อช่องต้องไม่เว้นว่าง กรุณาตั้งชื่อใหม่ | APPROVED | blank-name warning (REQ-001 Q13 / Req 16 / A15; wording approved via Q18) |

27 keys: the 25 original + `error.duplicateSlotName` (REQ-001 Q11) = the 26 approved
2026-08-22 (Q9), plus `error.blankSlotName` (REQ-001 Q13), drafted and approved the same
day (Q18). **All 27 are approved**; none is draft.

### The 27th key — `error.blankSlotName` — APPROVED 2026-08-22

Kept for the record: this is what Porter put to the human, and he chose the draft
unchanged (REQ-001 Q18). Nothing here is open.

- **What it is for.** REQ-001 Requirement 16 / criterion A15: the user clears a slot's
  name to blank and commits; the old name comes back **and** he wants a Thai warning
  (*"ขึ้นข้อความเตือนไทยด้วย"*). It appears in the same place, and behaves the same way, as
  the already-approved duplicate warning (§5 "Rename").
- **Draft value:** *"ชื่อช่องต้องไม่เว้นว่าง กรุณาตั้งชื่อใหม่"*
- **Why worded that way** — it follows the pattern he already approved for
  `error.duplicateSlotName` (*"มีช่องที่ใช้ชื่อนี้อยู่แล้ว กรุณาตั้งชื่ออื่น"*): state what is
  wrong, then `กรุณา` + what to do; "ช่อง" for *slot*; label-style, no final full stop.
- **The one alternative worth offering him**, if he wants it shorter and more
  instruction-like rather than diagnosis-first: *"กรุณาตั้งชื่อช่อง"*. Sober's
  recommendation is the longer draft, because a bare `กรุณา…` line does not tell the
  user *why* his rename bounced.
- **Answer shape that unblocks everything:** "approved", or a replacement Thai string.
  Either way it changes `src/i18n/th.ts` only — never logic, never a criterion. FE
  builds the behaviour against the key now, exactly as it did for the duplicate case.

Drafting notes from the first pass, kept for the record (the human approved all 26 keys
on 2026-08-22 with these choices explicitly in front of him):

- **"ช่อง" is the word used for *slot* everywhere.** If he prefers e.g. "กรอบ" or
  "ช่องภาพ", that is one find-and-replace across 8 keys.
- Buttons are **verb-first and short** (`เพิ่มช่อง`, `บันทึกเทมเพลต`) to fit a toolbar.
- The two I/O errors end with `กรุณาลองใหม่อีกครั้ง`; the two "this file / this name is
  wrong" messages do not, because retrying the same thing would not help.
- Nothing here is a full sentence with a final full stop — Thai UI text in this app is
  label-style throughout.
- The English default slot name `slot N` (REQ-001 Q6) is **not** in this table: it is
  generated data, not UI chrome, and it is deliberately English.

## 8. Tasks

- TASK-001: Project foundation — Electron + Vite + React + TS skeleton that runs (depends on: —) — **Jason (BE)**
- TASK-002: IPC seam — `shared/contract.ts`, preload API, save/open handlers (depends on: TASK-001) — **Jason (BE)**
- TASK-003: Layout Designer canvas + slot model (depends on: TASK-001 — and in practice
  on TASK-002’s `shared/contract.ts`, see TASK-003 Q-FE-5) — **Fern (FE)** — **DONE**,
  accepted 2026-08-22 at `77673af`
- TASK-004: Save / load wiring, template name, mode shell, dark mode (depends on: TASK-002, TASK-003) — **Fern (FE)** — **REWORK** 2026-08-22, one item (R1: trim the template name on the save path); everything else accepted. The last task of this SPEC.

## 9. Questions

**Q-SA-1 → Porter — CLOSED 2026-08-22.** The §7 Thai table was raised as REQ-001 Q9;
the human delegated the drafting to Sober and kept approval for himself. He reviewed
the 26-key draft and approved it in full — *"อนุมัติหมด"*, no per-key correction
(REQ-001 §Questions Q9). §7's heading and every row's `state` now say so, as Porter
asked. The 27th key that Requirement 16 added afterwards is tracked separately as
Q-SA-4 below.

**Q-SA-2 → Porter — CLOSED 2026-08-22.** Duplicate rename: refused *and* warned
(REQ-001 Q10 + Q11 → Requirement 15 / A11). Mechanism and placement are now written in
§5 "Rename"; the wording is `error.duplicateSlotName` in §7.

**Q-SA-3 → Porter — CLOSED 2026-08-22.** What happens when the user clears a slot's
name to blank: the human chose reading (b) — refused **with** a Thai warning (REQ-001
Q13 → Requirement 16 / A15). §5 "Rename" now carries that branch outright; the
provisional wordless refusal is deleted, not merely amended. As foreseen, it costs one
new §7 key, `error.blankSlotName`.

**Q-SA-4 → Porter — CLOSED 2026-08-22.** The human approved the drafted wording
unchanged (*"Q17=ก"* → REQ-001 §Questions **Q18**), so §7's row and heading now read
APPROVED and all 27 keys are final. The original question, kept for the record:
the Thai wording of that one new key,
`error.blankSlotName`, drafted 2026-08-22: *"ชื่อช่องต้องไม่เว้นว่าง กรุณาตั้งชื่อใหม่"*. It is
the 27th key and the only row of §7 not covered by the human's 26-key approval, because
it did not exist when he gave it. Rationale, the one alternative wording, and the
answer shape are written in §7 under "The 27th key" — Porter
takes that section to him and records the result in REQ-001 §Questions Q9, then it is
mirrored into §7's `state` column. **Not blocking:** the behaviour is fully specified
in §5 and TASK-003 builds it now; only the string can still change, in
`src/i18n/th.ts` alone. Acceptance criterion A15 is written to accept "whatever the
human approves", so no criterion moves either way.

**SA technical calls — all twelve settled, none open.** A-12 was added at TASK-003’s
review, closing its Q-FE-1. A-7…A-9 were added 2026-08-22
closing TASK-001 Q-BE-1…Q-BE-3; A-10 was added at TASK-001's round-2 review, closing
Q-BE-5. A-6 was **vetoed by the human** the same day and now reads the other way round —
re-read it before writing any name comparison.

- A-1. Slot colour is opaque `#rrggbb`, lower-case, no alpha. **Sober's call**, handed
  back by the human in REQ-001 Q12 ("ปล่อย Sober ตัดสินเอง"). Settled 2026-08-22.
- A-2. Canvas dimensions are integers limited to 1…10000. **Sober's call**, same Q12.
  Settled 2026-08-22.
- A-3. Shrinking the canvas leaves slots where they are, even outside the canvas.
  **Confirmed by the human** ("A-3/A-4/A-5 ถูกหมด") → acceptance criterion REQ-001 A12.
- A-4. The dark-mode choice is not remembered across restarts. **Confirmed** → A13.
- A-5. A successful save shows no confirmation. **Confirmed** → A14.
- A-6. **VETOED by the human 2026-08-22 — uniqueness is case-INSENSITIVE.** My original
  call (trimmed, case-sensitive exact equality, so `slot 1` and `Slot 1` were two
  allowed names) was the literal reading of REQ-001 A8; Porter put it to the human and
  he answered *"ไม่"*. The rule is now: compare the **trimmed** name
  **case-insensitively** (`a.trim().toLowerCase() === b.trim().toLowerCase()`) against
  every other slot in the template, so `Slot 1` collides with `slot 1` and is refused.
  Binding everywhere a name is compared — the rename action in the store (§5) and
  `parseTemplateFile`'s duplicate check on a hand-edited file (TASK-002). The stored
  name keeps the user's own casing; only the comparison is folded. REQ-001
  Requirement 5.3 / A8.
- A-7. **No Content-Security-Policy in REQ-001.** The app makes no network calls and
  in production loads only its own local `index.html`; `contextIsolation` and
  `sandbox` are already on. A real CSP is a `<meta>` on the production HTML that can
  only be honestly tested in a packaged build, and packaging is out of scope here —
  so it lands with the packaging work, not in TASK-002. **Sober's call** 2026-08-22,
  raised by TASK-001 Q-BE-3. No stakeholder input needed (nothing user-facing).
- A-8. **Toolchain baseline: Node >= 22.12.0; Electron = latest stable; Vite stays
  5.x; React stays 18.** Electron-latest is *not* an SA call — it is a stakeholder
  constraint (REQ-001 Q15). The Node floor is mine, and it is what latest Electron's
  installer demands; it is a documented README prerequisite, never enforced in code.
  Vite 5.x and React 18 are mine (the brief names "Vite" plainly and pins "React
  18"): they stay put for REQ-001 so the Electron move changes exactly one variable.
  **Sober's call** 2026-08-22, closing TASK-001 Q-BE-1. Also settled there: the move
  is rework inside TASK-001, not a new task.
- A-9. **No ESLint / `lint` script in REQ-001.** §2 listed one aspirationally; nothing
  in REQ-001 asks for a linter, so `npm run typecheck` (strict) is the only static
  gate. §2 corrected 2026-08-22. **Sober's call**, closing TASK-001 Q-BE-2.
- A-10. **The esbuild / Vite dev-server advisory stays unfixed for REQ-001, and a
  non-empty `npm audit` is not a defect here.** `esbuild <= 0.24.2` via `vite <= 6.4.2`
  (GHSA-67mh-4wv8-2f99) lets a web page talk to the **dev server**; the only offered
  fix is `vite@8`, a breaking move. **Not an SA call — the human ruled it directly**
  (*"ปล่อยช่องโหว่ไว้ — ไปต่อ"*, REQ-001 Q16 + §Constraints), on the facts that the app makes
  no network calls (§6) and nobody browses the dev server from an untrusted page.
  Nobody runs `npm audit fix --force`. Two limits: it is **not** a general security
  waiver, and it says nothing about the **packaged** build — Porter re-asks at
  packaging, together with the CSP of A-7. A different future advisory is a new
  question to Sober. Recorded 2026-08-22 from TASK-001 Q-BE-5.

- A-11. **What `parseTemplateFile` rejects on load.** The validator enforces the §3
  invariants the UI itself can never break — blank template `name`, blank slot `name`,
  duplicate slot `id`, non-positive slot `width`/`height` — and **does not** enforce
  contiguous/unique `zIndex`, which the renderer normalises on load instead. Full list
  and the reason for each: §3 "What a loaded file must satisfy". **Sober's call**
  2026-08-22, answering TASK-002 **Q-BE-6**; nothing user-facing beyond an already-
  approved Thai string (`error.fileUnreadable`), so no stakeholder input is needed.
  Also settled there (Q-BE-7): the written file keeps its trailing newline (§3).

- A-12. **The 8-colour rotation for new slots is fixed to these eight values**, in this
  order, first entry the one used in the §3 example: `#4f8ef7`, `#f76f4f`, `#4fbf6f`,
  `#b14ff7`, `#f7c94f`, `#4fd4d4`, `#f74f97`, `#7f8c9a` — opaque lower-case `#rrggbb`
  per A-1, distinct enough that five new slots never look alike. "Add slot" in §5 asked
  for a rotation but never named the colours; FE picked these and asked whose call it
  was (TASK-003 **Q-FE-1**). **Sober’s call** 2026-08-22: REQ-001 Q12 handed slot colour
  to me (*"ปล่อย Sober ตัดสินเอง"*), which is what A-1 already is, and the picker lets the
  user override any slot immediately — so no stakeholder round is spent on it. They live
  in `SLOT_COLORS` in `src/store/designerStore.ts`; a change is that one array.

**Build constraint that outlives TASK-001 (recorded here so TASK-002 cannot undo it
by accident):** `package.json` must NOT gain `"type": "module"`. Its absence is what
makes `vite-plugin-electron` emit CJS for main + preload, which `sandbox: true`
requires. A change there is a `## Questions` entry to Sober, not a local decision.

## 10. Hand-off without a commit (REQ-001 Q23) — binds every role from 2026-08-22

The human's standing rule, answered through Porter on 2026-08-22: **every git write is
his** — `git add`, `git commit`, branch creation and `git push` are all off-limits to
Porter, Sober, Jason and Fern. Editing files in the working tree is still ours.
Read-only git (`status`, `diff`, `log`, `rev-parse`, `show`) stays allowed. He left the
*shape* of the hand-off to us ("แล้วแต่เลย"); this section is that design.

Reviews used to cite a SHA ("accepted at `097c045`"). There is no SHA any more, so an
engineer finishing a TASK records a **hand-off packet** at the end of
§Implementation Notes, and the reviewer cites the packet instead:

1. **Base** — the commit the working tree sits on: `git rev-parse --short HEAD`.
2. **Change set** — the verbatim lines of `git status --porcelain` (` M` tracked,
   `??` untracked). This is the file list, and it must contain nothing outside the
   folders the TASK names.
3. **Fingerprint** — `sha256sum` of every file in that list, first 16 hex characters
   each. This is what makes the citation immutable: the reviewer re-hashes before
   reviewing, and a re-hash after a rework round proves what moved.

Rules that follow from it:

- **Never `git checkout` to "get to" a base commit.** The human's own uncommitted or
  unrelated files live in that tree; a checkout can silently drop them. If the code you
  need is byte-identical to some older SHA, prove it with `git diff --stat <sha> HEAD --
  <paths>` and say so — that is a valid base statement (Fern did this on TASK-004).
- A rework round re-records the packet; the review quotes both, so "what changed in R1"
  is answerable without a diff between commits.
- Board cells and reviews say **"accepted at base `<sha>` + packet"**, never "at `<sha>`"
  alone, until the human commits and a real SHA exists again.
- Nothing here asks the human to do anything at a particular time. He commits and syncs
  on his own schedule; the packet is what lets work be reviewed and accepted meanwhile.
- **Stacked hand-offs (added 2026-08-23, Sober).** An engineer may start a TASK that
  touches a file an *earlier, still-unreviewed* TASK also touched — waiting is not
  required and is not wanted. The packet then lists everything in the porcelain as
  usual, marks each such file with the earlier TASK's id, and carries a proof that
  earlier change is intact (an inverse-hash reproduction or the disjoint-hunk diff —
  either, not both). While the base is uncommitted the **accepted unit is the per-TASK
  hunk set, not the whole-file hash**, so a later TASK superseding a fingerprint is
  never a review finding and never unpicks an earlier acceptance. Reasoning and the two
  rejected alternatives: TASK-007 §Questions Q-FE-2.
