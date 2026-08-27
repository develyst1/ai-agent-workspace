# TASK-008: Photos into slots — one at a time, several at once, replace, remove
- Source: SPEC-002
- Status: **DONE**
- Owner: **Fern (FE)**
- Depends on: TASK-007

Covers REQ-002 Requirements 4, 5, 11, 13, 16, 17 and criteria B3, B13, B14, B16, B20, B21.

## Unblocked 2026-08-23 — the multi-fill rule is decided

This task was `BLOCKED` on Q-SA-1: does a multi-pick overwrite slots that already hold a
photo? **The human answered *"เฉพาะช่องว่าง"* — only the empty slots** (REQ-002 §Questions
**Q11**, transcribed into SPEC-002 §6 and §11). Build **only** that reading; the
overwrite-from-the-top reading (ข) is dead and must not appear in the code, in a comment
or in a test name.

Two more answers landed with it and both touch this task:

- **REQ-002 Q10 = ก — surplus photos are dropped *silently*.** No notice, no count, no
  message, and **no `useTemplate.photosDropped` key** — do not add one.
- **REQ-002 Q13 — all 18 Thai strings in SPEC-002 §7 are approved.** The values you put
  in `src/i18n/th.ts` are now the **shipped** wording, not drafts. Copy them exactly;
  inventing or "improving" a string is a defect, and a *new* string needs a `## Questions`
  entry to me before it ships.

Nothing in this task is waiting on anybody. One thing is *specced but flagged*, and it
does not stop you: **SA call B-11** (below, §3) rules that a corrupt photo among the
surplus fails the whole drop. That ruling is with Porter as `Q-SA-5` for confirmation —
**build it as specced**; if the answer flips it, it is one condition and one DoD line.

## What to do

### 0. One line of carry-over from TASK-007's review (N-SA-3)

`src/store/uiStore.ts` still documents `useTemplate` as *"visibly disabled (A6), so
`setMode` is never called with it today"*. TASK-007 made that false and its own file list
correctly kept you out of `uiStore.ts`. **Correct that doc comment and nothing else in that
file** — no code, no types, no other comment. One sentence, e.g. that both modes are live
from TASK-007 and the store stays a plain in-memory container (SPEC-002 §6, B-5).

### 1. `src/lib/cover.ts` (new)

`coverSourceRect(imgW, imgH, slotW, slotH): SourceRect` — SPEC-002 §5, verbatim,
including the `<= 0` / non-finite guard returning all zeros. Pure: no DOM, no imports.

### 2. `src/store/useTemplateStore.ts`

- `setPhoto(slotId, photo: PlacedPhoto)` — replaces whatever is there and
  **revokes the replaced photo's object URL** (Req 13 / B16).
- `removePhoto(slotId)` — clears the entry and revokes its URL (Req 16 / B20).
- `fillFromPhotos(photos: PlacedPhoto[])` — the several-at-once path, **now fully
  specified** (Q-SA-1 = ก). Walk the slots in **on-screen list order (top-most first)**
  and, for each slot **that has no photo**, consume the next photo in the batch. Stop when
  the empty slots run out or the photos run out.
  - A slot that already holds a photo is **skipped, never overwritten** — its photo, its
    object URL and its `fileName` are untouched (Req 4 / Q11 / B13).
  - **Surplus photos are discarded** and the call still succeeds — no throw, no refusal,
    and **nothing is shown to the user** (Req 17 / Q10 = ก / B21). "The slots that fit"
    means the **empty** ones, so the surplus is whatever is left after they are filled.
  - **Revoke the object URL of every photo the fill did not use**, at the end of the fill
    (SA call B-11 — see §3; the batch is decoded before it is placed, so those URLs do
    exist). Never leak one.
  - A batch of zero empty slots is legal: every photo is surplus, every URL is revoked,
    nothing changes on screen, no error.
- `loadTemplate` already revokes everything (TASK-007) — make sure that still holds once
  `photos` can actually be non-empty.

### 3. Decoding — one helper, both paths (SPEC-002 §6 "Decoding")

**Two things were added here on 2026-08-23, out of TASK-005's review — read SPEC-002 §6
"Decoding" as it now stands, not as you may remember it:**

- **The Req 11 magic-number gate (SA call B-10).** Before making the `Blob`: JPEG must
  start `FF D8 FF`, PNG must start `89 50 4E 47 0D 0A 1A 0A`; anything else takes the
  decode-failure path below without ever being decoded. Do **not** gate on `mimeType` or
  on the file name. Reasoning: TASK-005 §Review F.
- **Prove the bytes survived the seam (N-SA-1).** Nobody in this team has been able to
  run Electron, so `PickedImage.bytes` crossing `contextBridge` is the one unproven link
  in the whole photo path. The **first** thing you check on the real app: `bytes` is an
  actual `Uint8Array` (`instanceof`) and its `length` equals the file's size on disk. If
  it is not, stop — that is a seam problem and it comes to me as a `## Questions` entry;
  do not work around it in `src/`.

`new Blob([bytes], { type: mimeType })` → `URL.createObjectURL` → `new Image()` → await
load. On the image's `error`: **revoke the URL**, place nothing anywhere, show
`error.photoUnreadable`. Never base64, never a data URL.

For the several-at-once path, **gate and decode the whole batch first — surplus photos
included — before any of it is placed**; if **any** of them fails the gate or fails to
decode, revoke every URL created in that batch, place nothing, and show
`error.photoUnreadable`. Same all-or-nothing rule main uses for reading (SPEC-002 B-4).

**Then hand the decoded batch to `fillFromPhotos`, which revokes the URLs of the photos it
did not use** (SA call B-11, added 2026-08-23). SPEC-002 §6 used to say the surplus URLs
"are never created in the first place" — that was wrong and is corrected: they *are*
created, because the batch is validated as a unit, so the fill is what releases them.
Do not try to be clever and decode lazily; the two rules only stay consistent this way.
*(The one consequence — a corrupt photo among the **surplus** fails the whole drop — is
with Porter as `Q-SA-5` for confirmation. Build it as written.)*

### 4. UI

- `UseTemplateSlotPanel` rows gain `useTemplate.pickPhoto` (always) and
  `useTemplate.removePhoto` (only on a filled row). `pickPhoto` calls
  `window.api.pickImages({ dialogTitle: th['dialog.pickPhotos.title'], fileTypeLabel:
  th['dialog.photoTypeLabel'], multiple: false })` and puts the single result into
  **that row's** slot. Row buttons follow `SlotListPanel`'s `ROW_BUTTON` styling.
- `UseTemplateView`'s toolbar gains `useTemplate.pickManyPhotos`, calling the same API
  with `multiple: true` and handing the result to `fillFromPhotos`.
- `canceled` → no-op on both. `error` → log `detail`, show `error.photoLoadFailed`.
- `UseTemplateCanvas`: a slot **with** a photo renders a Konva `Image` at the slot's
  `x`/`y`/`width`/`height` with `crop={coverSourceRect(img.naturalWidth,
  img.naturalHeight, slot.width, slot.height)}` and **no name label**; empty slots stay
  as TASK-007 drew them.
- `src/i18n/th.ts`: add `useTemplate.pickPhoto`, `useTemplate.pickManyPhotos`,
  `useTemplate.removePhoto`, `dialog.pickPhotos.title`, `dialog.photoTypeLabel`,
  `error.photoUnreadable`, `error.photoLoadFailed` from SPEC-002 §7. **Those values are
  APPROVED (REQ-002 Q13) — copy them character for character; they are what ships.** Add
  no other key, and in particular **no `useTemplate.photosDropped`** (Q10 = ก, silent).

## Constraints

- Do not touch `shared/`, `electron/` or build config. If you need something the seam
  does not give you, that is a `## Questions` entry to me — never a new channel.
- Do not touch the designer.
- No git write (SPEC-001 §10). Hand off uncommitted with a packet.

## Definition of Done

- [x] **N-SA-3:** `src/store/uiStore.ts` no longer claims the Use Template entry is
      disabled or that `setMode` is never called with it; `git diff` on that file shows a
      comment change and nothing else.
- [x] `coverSourceRect` asserted against hand-computed values for: a wide image in a tall
      slot, a tall image in a wide slot, an exact-ratio match (must return the whole
      image), a square in a square, and each of the guard cases. Assert the returned
      rectangle is always **inside** the image and always **exactly** the slot's ratio.
- [x] Replace: putting a second photo into a filled slot leaves one entry and **revokes
      the first URL exactly once** (spy on `revokeObjectURL`).
- [x] Remove: the slot goes empty, the URL is revoked once, and the preview renders the
      empty rect + name again.
- [x] Re-picking a template with photos in place revokes **every** URL and clears
      `photos`.
- [x] Decode failure: a batch where one file is not a real image places nothing and
      revokes every URL it created.
- [x] **Req 11 gate (B-10):** bytes whose first bytes are neither `FF D8 FF` nor the PNG
      signature are refused **without being decoded** — assert on the helper directly with
      a GIF header (`47 49 46 38`), an empty array, and two bytes of a JPEG header; assert
      a real JPEG header and a real PNG header both pass. No new Thai key: the refusal
      shows `error.photoUnreadable`.
- [ ] *(open — routed to the human’s acceptance pass, Q-FE-6; see §Review E)* **N-SA-1, on the real app, not in a harness:** a picked photo's `bytes` is an
      `instanceof Uint8Array` in the renderer and its `length` equals the file's size.
      Record the two numbers in §Implementation Notes.
- [x] **Multi-fill skips filled slots (Q-SA-1 = ก / Req 4 / B13).** Template with 4 slots,
      slots 2 and 4 (in on-screen order) already filled by hand; multi-pick 2 photos →
      they land in slots **1 and 3**, in that order, and slots 2 and 4 still hold the
      **same** photo objects and the **same** object URLs as before (assert identity, not
      just non-emptiness). Nothing was revoked for slots 2 and 4.
- [x] **Multi-fill order + surplus (Req 17 / Q10 = ก / B21).** More photos than empty
      slots: the empty slots fill in **top-most-first** order, the call throws nothing, the
      store is left consistent, and **no message is set** — assert the alert state is still
      empty afterwards (silence is a checkable behaviour, not an absence of code).
- [x] **Surplus URLs are released (B-11).** In the surplus case, `revokeObjectURL` is
      called **exactly once per unused photo** and **not once** for any photo that was
      placed (spy on it and compare the URL arguments, not just the call count). Zero empty
      slots + N photos → N revokes, no placement, no error.
- [x] **Corrupt file among the surplus (B-11, the flagged edge).** A batch where a photo
      *beyond* the empty-slot count fails the gate places **nothing**, revokes every URL of
      that batch, and shows `error.photoUnreadable`. Add a one-line comment in the test
      naming `Q-SA-5` so it is easy to flip if the human reverses it.
- [x] `npm run typecheck` exit 0, `npm run build` exit 0.
- [x] Hand-off packet recorded (SPEC-001 §10). Nothing outside `src/`.
- [ ] *(the human’s, by design)* Not verified by you, listed for the human's acceptance pass: the real photo picker
      offering JPG/PNG (B14), and that a placed photo looks centre-cropped and undistorted
      on screen (B3).

## Implementation Notes

*(Fern, 2026-08-23)*

### What changed — 8 files, all under `src/`

Base is the real commit **`6879acf`** and the tree was **clean** when I started, so TASK-006
and TASK-007 are already in git: **this is not a stacked hand-off** and every file below is
this task's own work.

| File | Change |
|------|--------|
| `src/lib/cover.ts` **(new, 43 lines)** | `coverSourceRect` + `SourceRect`, SPEC-002 §5 verbatim including the `<= 0` / non-finite guard. Pure — no DOM, no imports. |
| `src/lib/photo.ts` **(new, 92 lines)** | The one decode helper both paths use. `hasImageMagic(bytes)` is the Req 11 gate (B-10) exported on its own so it is assertable directly; `decodePhotos(images)` gates + decodes the **whole** batch and returns `PlacedPhoto[]`, or `null` after revoking every URL it created (B-4 / B-11). `Blob` → `createObjectURL` → `new Image()`; never base64, never a data URL. |
| `src/store/useTemplateStore.ts` | `setPhoto` (revokes the replaced URL), `removePhoto` (revokes, no-op on an empty or unknown slot), `fillFromPhotos` (walks `[...slots].reverse()` = on-screen order, skips filled slots, revokes exactly the photos it did not use). `loadTemplate` unchanged — its TASK-007 revoke loop now has something to revoke. |
| `src/components/UseTemplateSlotPanel.tsx` | Per-row `useTemplate.pickPhoto` (always) and `useTemplate.removePhoto` (filled rows only), both with the designer's `ROW_BUTTON` class string; the single-file pick handler; new `onMessage` prop. |
| `src/components/UseTemplateView.tsx` | Toolbar `useTemplate.pickManyPhotos` + its handler; `IoErrorKey` widened and renamed to the exported `UseTemplateMessageKey` (4 keys); `ioErrorKey` renamed `messageKey`. Still **exactly one** `useState`. |
| `src/components/UseTemplateCanvas.tsx` | A filled slot renders a Konva `Image` at the slot rect with `crop={{x: sx, y: sy, width: sw, height: sh}}` and **no** name label; empty slots are TASK-007's `Rect` + `Text`, untouched. `fitScale` unchanged. |
| `src/i18n/th.ts` | The **7** SPEC-002 §7 keys this task needs, values copied code point for code point from the approved table; header re-counted 32 → 39 (26 SPEC-001 + 13 SPEC-002). **No `useTemplate.photosDropped`** — Q10 = ก. |
| `src/store/uiStore.ts` | **N-SA-3 only.** The doc comment no longer says Use Template is disabled and `setMode` is never called with it. `git diff` on that file is three comment lines and nothing else. |

`shared/`, `electron/`, build config and the whole designer are **untouched**.

### Four calls I made, so you can overrule any of them at review

1. **The decode helper lives in `src/lib/photo.ts`.** The TASK says "one helper, both paths"
   without naming a file; `src/lib/` is where `cover.ts` and `template.ts` already are. The
   gate is exported separately from the decoder so the DoD's "assert on the helper directly"
   is a real unit assertion and not a decode round trip.
2. **`decodePhotos` imports `PlacedPhoto` from the store as a `type`-only import.** It is
   erased at compile time, so `lib/` still has no runtime dependency on `store/`. The
   alternative — a second identical interface in `lib/` — duplicates a type for nothing.
3. **The message line stays in `UseTemplateView`, and the panel writes it through an
   `onMessage` prop.** SPEC-002 §6 "Messages" puts **one** `role="alert"` line at the end of
   the Use Template toolbar; the per-row buttons live in the panel and must reach it. Lifting
   the key into the store was the other option and I rejected it — §6 calls the message
   "transient UI state only, never stored".
4. **One `as Uint8Array<ArrayBuffer>` in `photo.ts`, with the reasoning in a comment.**
   `PickedImage.bytes` is declared `Uint8Array`, which TypeScript widens to
   `Uint8Array<ArrayBufferLike>` — possibly a `SharedArrayBuffer`, which `BlobPart` excludes,
   so `new Blob([picked.bytes])` does not typecheck. Bytes over `contextBridge` are never
   shared memory. The narrowing copies nothing; the other fix is one word in
   `shared/contract.ts` and that is yours, not mine — **Q-FE-7**.

### Verification — 243 assertions, 243 passed, plus typecheck and build

`npm run typecheck` → **exit 0**. `npm run build` → **exit 0** (renderer 460.92 kB, plus
`main.js` and `preload.js`).

Two probes, bundled with the repo's own esbuild against the **real** modules and run in Node.
Entry files, bundles and the probe-only shims live in this session's scratchpad — **nothing
was added to the tree** (the packet below is the proof). `Blob`, `URL.createObjectURL` /
`revokeObjectURL` and `Image` are replaced by recorders, so every object URL's whole life is
observable; the fake JPEG/PNG bytes carry their own "decodes / does not decode" and natural
size, so decode outcomes are deterministic rather than timing-dependent.

**Probe A — `cover.ts`, `photo.ts` and the store, 118/118.** No components.

| DoD box | What was asserted | Result |
|---------|-------------------|--------|
| `coverSourceRect` | The five hand-computed cases (wide-in-tall `{1750,0,500,1000}`, tall-in-wide `{0,1750,1000,500}`, exact ratio = the **whole** image, square-in-square, image identical to slot); **20 guard cases** — each of the four inputs × `0 / -1 / NaN / ±Infinity` — all zeros; a **144-case sweep** asserting every rect is inside the image, is **exactly** the slot's ratio, and touches an edge (i.e. is the largest such rect); and that fractions are not rounded and the rect is centred on both axes. | 34/34 |
| Req 11 gate (B-10) | GIF header, empty array, two bytes of a JPEG header, a 7-byte PNG signature, BMP, a wrong third JPEG byte and a wrong eighth PNG byte all **refused**; real JPEG and real PNG headers **accepted**. Through `decodePhotos`: a GIF whose `mimeType` says `image/png` is refused **and no object URL is ever created**, and a real JPEG named `.gif` is **accepted** — the gate is on the bytes, not the name or the hint. | 13/13 |
| Decode failure | A clean 3-file batch: order preserved, three distinct `blob:` URLs, none revoked, natural sizes from the decoded image, the `Blob` carrying the picked `mimeType`. A gate failure mid-batch → `null`, the one URL made before it revoked, **the file after it never given one**. A *decode* failure at index 3 → `null`, all three created, all three revoked, nothing live. A gate failure at index 0 → `null`, **zero** URLs. An empty batch → `[]`, not a failure. | 20/20 |
| Replace / Remove / Re-pick | Replace: one entry left, the **first** URL revoked **exactly once**, the second not revoked, one revoke in total. Remove: entry gone, URL revoked once, and removing again — or removing an unknown slot — revokes nothing more. Re-pick: both URLs revoked, `photos` back to `{}`, nothing live, only the new file's slot ids present. | 18/18 |
| Multi-fill skips filled slots | 4 slots, on-screen rows 2 and 4 filled by hand, 2 photos picked → they land in rows **1 and 3** in that order; rows 2 and 4 are asserted to be **the same photo objects** (`===`), same object URLs, same `fileName`; **nothing revoked at all**. | 10/10 |
| Order + surplus + B-11 | 4 empty slots, 6 photos: throws nothing, fills rows 1-4 top-most first, and the revoked set is **exactly** the two unused URLs — compared as URLs, not as a count — with no placed photo revoked. Zero empty slots + 3 photos → 3 revokes, the two existing photos still the same objects. No template + 2 photos → both revoked. Empty batch → nothing placed, nothing revoked. | 18/18 |
| End to end | 3 slots, 5 files decoded then filled: rows 1-3 in pick order, 5 URLs created, 2 revoked, and the 3 still live are **exactly** the placed photos' URLs. Plus the crop the wide one will be drawn with. | 6/6 |

**Probe B — the three components and their own handlers, 125/125.** They are called as plain
functions against shimmed hooks (`useSyncExternalStore` → `getSnapshot()`, so the **real**
zustand store is read; `useState` returns a probe-supplied value and **records every setter
call**). react-konva nodes become named markers.

- **The canary is C0 and it runs first**: the panel's markup is asserted to *move* when the
  store moves, to show the new slot and not the old one. If the components were not reading
  the real store, nothing below counts. It also pins `th` at **39** keys and asserts
  `useTemplate.photosDropped` is **not** one of them.
- **The panel:** one row per slot, rows **top-most first**, every row carries `เลือกรูป`, no
  row carries `เอารูปออก` while every slot is empty; a filled row gains the remove button and
  loses `ยังไม่มีรูป` while the empty one keeps it, and still offers `เลือกรูป` (replace is
  per-slot). The row-button class is asserted **character for character** against the
  `ROW_BUTTON` string read out of `SlotListPanel.tsx` itself. No Latin in the panel's text.
- **The single pick**, by calling each row's **own** `onClick` with `window.api.pickImages`
  stubbed: the options object is asserted whole — `เลือกไฟล์รูปภาพ`, `ไฟล์รูปภาพ (JPG, PNG)`,
  `multiple: false`. `picked` → the photo lands in **that** row's slot and no other, no
  message, nothing logged, nothing revoked. `canceled` → nothing placed, no message, no URL.
  `error` → `error.photoLoadFailed`, the English `EACCES` **logged and never rendered**. A
  GIF → `error.photoUnreadable` **with zero URLs created**. A damaged JPEG →
  `error.photoUnreadable`, nothing live. Replace through the UI → first URL revoked once.
  Row 2's button fills row 2 and neither row 1 nor row 3.
- **Remove through the UI** → slot empty, URL revoked once, the row shows `ยังไม่มีรูป` again,
  the remove button is gone, and the **preview draws the rectangle and the name once more**.
- **The multi-pick**, through the toolbar button's own `onClick`: options asserted whole with
  `multiple: true`; fills top-most first; skips hand-filled rows with **object identity** and
  revokes neither of their URLs. **Surplus is silent** — the message setter is asserted to
  have been called with `null` and **nothing else**, the view renders **no `role="alert"`
  node at all**, exactly the three surplus URLs are revoked, and nothing is logged. Zero
  empty slots → both surplus URLs revoked, silently. `canceled` / `error` behave like the
  single path. `Z1` asserts **no handler threw** anywhere in the run.
- **A corrupt file among the surplus** (the flagged edge): nothing placed, `error.photoUnreadable`
  shown, 2 created / 2 revoked, nothing live. The block carries a comment naming **Q-SA-5**.
- **The alert line**: exactly one, at the end of the toolbar, rendering each of
  `photoUnreadable` / `photoLoadFailed` / `fileUnreadable` verbatim with the designer's
  `text-red-600 dark:text-red-400` pair.
- **The Konva preview**: with one of three slots filled, the layer holds background + 2 rects
  + 1 image + 2 labels **in that order** (`Rect, Rect, Text, Image, Rect, Text`) — so paint
  order is still back-most first and the photo sits in its slot's place; the `Image` is at the
  slot's `x/y/width/height`, is the decoded element itself, is `listening={false}`, and its
  `crop` is the **Konva-shaped** `{x, y, width, height}` (asserted `{500,0,200,400}` for a
  1200×400 photo in a 100×200 slot). The filled slot has **no** label; the empty ones keep
  theirs and still carry **no `fill`**. All slots filled → 2 images, **0 labels**, 1 rect.
  A zero-sized decoded image → **nothing drawn for that slot** (SPEC-002 §5's guard). Nothing
  draggable, no `Transformer`, and the scale cap still returns 1.

**Negative controls — 17 deliberate regressions, every one caught.** Each was applied to the
real file, both probes were run, and the file was restored in a `finally`; the run ends by
re-hashing all 8 files against their starting sha256 (**"files whose sha256 moved: none"**).

| Break | Assertions that failed |
|-------|------------------------|
| `fillFromPhotos` overwrites filled slots (the dead reading ข) | 12 |
| it stops revoking the surplus | 10 |
| it walks store order instead of on-screen order | 8 |
| it throws on a surplus | 5 (incl. `Z1`) |
| `setPhoto` stops revoking the replaced URL | 3 |
| `removePhoto` stops revoking | 4 |
| the Req 11 gate lets everything through | 12 |
| `decodePhotos` returns the partial batch instead of failing it | 15 |
| `coverSourceRect` uses `max` instead of `min` | 9 |
| the preview never takes the photo branch | 18 |
| the panel stops reversing its rows | 9 |
| the remove button shows on every row | 3 |
| the crop is passed in `SourceRect` shape, not Konva shape | 2 |
| the single pick asks for `multiple: true` | 1 |
| the multi pick asks for `multiple: false` | 1 |
| a row picks into the first slot instead of its own | 2 |
| a decode failure is swallowed | 1 |
| — | after every revert: 118/118 and 125/125 again |

### What I could NOT verify — including one DoD box, which is why it is a question

1. **N-SA-1, the seam check, is the DoD box I cannot tick — see Q-FE-6.** It is specified
   "on the real app, not in a harness". I have no window, no native dialog I can drive, and
   `../project-docs/` holds no sample photo, so I cannot pick a real file and compare
   `bytes.length` to its size on disk. **I have not verified that `PickedImage.bytes` survives
   `contextBridge` as a `Uint8Array`, and nothing above should be read as if I had.** What the
   probes do cover is everything downstream of it: given a `Uint8Array`, the gate, the decode,
   the placement and the revocation are all asserted.
2. **B14, for the human's acceptance pass** — that the real photo picker offers JPG/PNG.
3. **B3, for the human's acceptance pass** — that a placed photo actually *looks*
   centre-cropped and undistorted on screen. The arithmetic is asserted 34 ways; the pixels
   are not, because nobody here has a screen.

Still open and untouched by this task: **B12 + B9** from TASK-007, and the Q-FE-1 dark-mode
TASK, which is yours.

### Hand-off packet (SPEC-001 §10)

```
base 6879acf (full 6879acf779d825027f7d9d5a95f2e3f7f0131a1f)
 M src/components/UseTemplateCanvas.tsx      2f5dc69c56701ea4
 M src/components/UseTemplateSlotPanel.tsx   fa2557ff45883519
 M src/components/UseTemplateView.tsx        0bcd845e8b291fb0
 M src/i18n/th.ts                            ab61d3fca58f7bdb
 M src/store/uiStore.ts                      abc1b11b80c1b4d2
 M src/store/useTemplateStore.ts             67d0191acac79bac
?? src/lib/cover.ts                          b0650975c0d56c32
?? src/lib/photo.ts                          18f80f7b38afb46a
```

Eight files, all under `src/`. `git diff --stat` on the six tracked ones →
`6 files changed, 284 insertions(+), 56 deletions(-)`; the two new files are 135 lines.
**Not a stacked hand-off** — the base is a real commit and the tree was clean before I
started, so no earlier TASK's fingerprint is superseded here.
No git write of any kind — no `add`, no `commit`, no branch, no push. `dist/` and
`dist-electron/` moved when I ran the build but are gitignored, so they are not in the
porcelain.

## Questions

*(Fern asks as `Q-FE-n`; Sober answers as `> answer: ...`.)*

**Q-FE-5 — non-blocking. Should `เลือกหลายรูป` be offered before a template is loaded?**
The TASK says the toolbar "gains `useTemplate.pickManyPhotos`" without a condition, so I
render it unconditionally, and §2's "a batch of zero empty slots is legal" then describes
exactly what happens: with no template the user picks photos, every one is surplus, every URL
is revoked, and — because Q10 = ก — **nothing at all is shown**. That is the specced behaviour
and it is what I built, but from the user's side it is a button that opens a dialog and then
appears to do nothing. Three shapes, all one line: **(ก)** leave it as built; **(ข)** hide the
button until `template` is non-null (the current-template label already does this); **(ค)**
render it disabled until then. This is a UI-affordance call, not a rule change — no
requirement moves either way, and I did not want to invent (ข) or (ค) on my own.

> answer (Sober, 2026-08-23): **(ข) — hide it until a template is loaded, and it is not a
> rework of this TASK.** You were right to ask rather than pick. Reasoning, so it is
> reviewable: this mode already hides everything that needs a template — the preview
> canvas and the `useTemplate.currentTemplate` label are both rendered only when
> `template` is non-null — so hiding a third such control is the mode's own pattern, not
> a new idea. (ค) loses to (ข) here on SPEC-002 **B-7**'s own logic: B-7 refuses to
> disable Generate *because a disabled button cannot name its reason*, and this button
> cannot name one either — Q10 = ก forbids any message on this path. A control that can
> neither act nor explain itself should not be on screen. No string, no requirement and no
> criterion moves.
> **Where it lands: TASK-009 §0**, not here. It is one condition on a button in
> `UseTemplateView`'s toolbar — the very file and the very toolbar TASK-009 opens next to
> add Generate — so folding it in costs nothing, exactly as N-SA-3 was folded into this
> TASK's §0 instead of a rework hop for TASK-007. Recorded in SPEC-002 §6 + §9 as **SA
> call B-12** so the spec and the code do not drift. Porter has it as an FYI for the
> human's acceptance pass; if the human wants the button visible-but-inert, that is one
> line back the other way.

**Q-FE-6 — the N-SA-1 DoD box, which I cannot tick. How should it be routed?**
The box asks for a real-app check: `bytes instanceof Uint8Array` and `bytes.length` equal to
the file's size on disk, with both numbers recorded here. Doing it needs a running Electron
window, a native Open dialog someone can click, and a real JPG/PNG on disk — I have none of
the three, and `../project-docs/` holds no sample photo. So the one unproven link in the photo
path is still unproven, and I will not write numbers I did not measure. **(ก)** it joins B14 /
B3 / B12 / B9 on the board as the human's acceptance pass; **(ข)** it becomes a DATA REQUEST
up the chain (he opens the app, picks one photo, and reports the two numbers plus the file's
size in bytes); or **(ค)** something else you have in mind. Everything downstream of that
`Uint8Array` is asserted 243 ways, so nothing else in this task is waiting on it — but the
TASK made it a DoD box, so it is your call how it is discharged, not mine to quietly drop.

> answer (Sober, 2026-08-23): **(ก), with a named fallback — and you were right to leave
> it un-ticked.** Writing numbers you did not measure would have been the only wrong move
> here. Splitting the box in two makes the routing obvious:
> **(a) does `bytes` survive the seam as something a `Blob` can consume?** The human's
> acceptance pass answers this without being asked anything extra: if a picked photo
> visibly appears inside its slot, the bytes crossed, the magic gate saw them, the `Blob`
> was built from them and the browser decoded them. That is criteria **B14 + B3**, already
> his. So this box **joins B14 / B3 / B12 / B9 on the board as an acceptance item** rather
> than burning a human round trip on a check his own pass performs anyway.
> **(b) the two diagnostic numbers** (`instanceof Uint8Array`, `bytes.length` = the file's
> size on disk) are only needed **if (a) fails**. If a photo does *not* appear, it becomes
> a **DATA REQUEST** through Porter at that moment — and it comes back to **me** as a seam
> problem, not to you as an FE bug. Do not work around it in `src/` in any case; that part
> of §3 stands.
> One thing this does **not** do: it does not weaken the box for TASK-009. That task's own
> N-SA-1 (the outbound `Uint8Array` landing on `png:save`'s `INVALID_PAYLOAD` guard) is
> the same seam in the other direction and is unchanged.

**Q-FE-7 — non-blocking, and it touches `shared/`, so it is yours by definition.**
`PickedImage.bytes: Uint8Array` widens to `Uint8Array<ArrayBufferLike>` in TypeScript 5.9,
and `BlobPart` excludes `SharedArrayBuffer`, so `new Blob([picked.bytes], …)` does not
typecheck (`TS2322`). I fixed it inside my own file with one narrowing assertion and a comment
saying why it is sound (bytes over `contextBridge` are never shared memory) — it copies
nothing. The tidier fix is to declare the field `Uint8Array<ArrayBuffer>` in
`shared/contract.ts`, which would delete my assertion; TASK-009 will hit the mirror image on
`savePng(bytes)`, so it is worth settling once rather than twice. I did not touch `shared/`.

> answer (Sober, 2026-08-23): **Your local narrowing stands — keep it, no rework — and the
> `shared/` fix is real, but it is not yours and it is not this TASK.** Correctly routed:
> `shared/contract.ts` is the seam and the seam is mine.
> I measured your proposal rather than agreeing with it. On a scratch copy I declared
> `bytes: Uint8Array<ArrayBuffer>` in `shared/contract.ts` and **deleted** your assertion:
> both `tsc` projects came back **exit 0**, so the change is safe for `electron/` too —
> `fs.readFile`'s `Buffer` still assigns to the narrowed field. The control run (assertion
> deleted, `shared/` untouched) reproduces your `TS2322` verbatim, `SharedArrayBuffer` and
> all, so your diagnosis is exact. The repo was restored and re-hashed both times; I made
> no git write.
> Why it still does not happen now: it is a `shared/` edit, which is **Jason's** file to
> touch under my seam design, and this session is one unit. One correction to your
> reasoning, so nobody plans around it: the `savePng` direction is **not** the same
> problem — there the renderer *builds* `new Uint8Array(arrayBuffer)`, which is already
> `Uint8Array<ArrayBuffer>` and widens fine. So there may be exactly one site, not two. I
> will settle it in its own small BE TASK once TASK-009 shows whether it really is one; it
> blocks nobody and your comment already says why the assertion is sound.

## Review

*(Sober, 2026-08-23)*

**Verdict: DONE.** Accepted as it stands in `de33ff9` (base `6879acf` + the 8-file packet).
Everything below I verified against the real files myself — none of it is copied from
§Implementation Notes.

### A. The packet is the commit, and the commit is the packet

Read-only `git` only; I made no git write of any kind. Tip `de33ff9ad09d171abd769142ced183de303416eb`,
parent `6879acf779d825027f7d9d5a95f2e3f7f0131a1f`, tree clean. `git diff --name-status 6879acf de33ff9`
is **exactly** the 8 files of §Hand-off packet — 6 modified, 2 added — with nothing under
`shared/`, `electron/`, build config or the designer. All **8 sha256(16) prefixes match** the
packet character for character, and still matched after everything below. The `uiStore.ts` diff is
three comment lines and nothing else (N-SA-3, discharged). The `th.ts` diff adds **exactly** the 7
approved keys and no eighth.
*(The commit id is my read-only observation, not the human's word — REQ-002 **Q20** is still
Porter's to close, exactly as Q15 and Q17 were.)*

### B. My own probes — 171 assertions, 171 passed

Written by me from the SPEC, bundled with the repo's own esbuild against the **real** modules and
run in Node. `Blob`, `URL.createObjectURL` / `revokeObjectURL` and `Image` are recorders, so every
object URL's whole life is observable; the fake bytes carry their own decode outcome and natural
size, so nothing is timing-dependent. Entry files, bundles and shims live in this session's
scratchpad — **nothing was added to the repo tree** (§A's re-hash is the proof).

- **Probe A — `cover.ts`, `photo.ts` and the store: 72/72.** The five hand-computed crops plus
  `1200x400` in a `100x200` slot → `{500,0,200,400}`; all **20** guard cases (each of the four
  inputs × `0 / -1 / NaN / ±Infinity`) → all zeros; a **144-case sweep** asserting every rect is
  inside the image, is *exactly* the slot's ratio, **touches an image edge** (i.e. is the largest
  such rect) and is centred on both axes; fractions unrounded. Gate: 11 cases, including JPEG
  magic **not at offset 0**. `decodePhotos`: a clean 3-batch; a gate failure mid-batch (one URL
  created, that one revoked, the file *after* it never given one); a decode failure at the last
  index (3 created, 3 revoked, nothing live); a gate failure at index 0 (**zero** URLs ever
  created); an empty batch → `[]`, not a failure; a GIF declaring `image/png` **and** named
  `.png` refused with no URL; a real JPEG named `.gif` accepted; and the `Blob` asserted to hold
  the picked bytes **by object identity** — no copy, no base64. Store: replace, remove,
  remove-twice, unknown slot, re-pick, multi-fill skipping **by object identity**, order +
  surplus with the revoked set compared **as URLs** rather than as a count, zero empty slots, no
  template at all, an empty batch, and a 5-decode → 3-fill end-to-end where the URLs still live
  are exactly the three placed photos'.
- **Probe B — the three components and their own handlers: 99/99.** They are called as plain
  functions against a React shim whose `useSyncExternalStore` returns `getSnapshot()`, so the
  **real** zustand store is read; react-konva nodes become markers. **The canary C0 runs first**
  and asserts the panel's markup *moves* when the store moves — if the components were not reading
  the real store, nothing below would count. `th` is pinned at **39** keys, with
  `useTemplate.photosDropped` **absent** and each of the 7 new values compared code point for code
  point. Both pick-options objects are asserted **whole**. Row 2's own `onClick` fills row 2 and
  neither row 1 nor row 3. `canceled` / `error` / a GIF / a damaged JPEG on **both** paths, with
  the English `EACCES` logged and asserted **never rendered**. **Silence is measured, not assumed**:
  after a surplus the message setter was called with `null` and nothing else, and the view renders
  **no `role="alert"` node at all**. The layer's children are `Rect, Rect, Text, Image, Rect, Text`
  — paint order intact and the photo in its own slot's place; the filled slot carries no label; the
  empty rects carry **no `fill`**; the `crop` is the **Konva-shaped** `{500,0,200,400}`; a
  zero-sized decoded image draws **nothing**; the alert line is the **last** node of the toolbar and
  renders all four keys verbatim in the designer's red pair. The row-button class was compared
  character for character against the `ROW_BUTTON` string read out of `SlotListPanel.tsx` itself.

### C. Negative controls — 20 deliberate regressions, all 20 caught

Applied to a **scratch copy** of `src/`, never to the repo: `git status --porcelain` was empty at
every step. Baseline and post-restore runs both 72/72 + 99/99, and each mutation was hash-checked
to have actually applied. Overwriting filled slots → 10 assertions fail; dropping the surplus
revoke → 7; walking store order instead of on-screen order → 6; `setPhoto` not revoking the
replaced URL → 2; `removePhoto` not revoking → 3; `loadTemplate` not revoking on re-pick → 1; the
gate letting everything through → 17; `decodePhotos` returning the partial batch → 12; `max` for
`min` in `coverSourceRect` → 8; dropping the `cover` guard → 1; dropping the zero-image guard → 1;
a SourceRect-shaped `crop` → 1; each `multiple` flag flipped → 1 each; a swallowed decode failure
→ 1; the remove button on every row → 3. Four more (no photo branch, unreversed rows, a row
picking into slot 1, no alert line) made probe B **throw** on the node that had vanished — caught,
if less tidily than a failed assertion.

### D. Typecheck and build, run by me from the repo

`npm run typecheck` → **exit 0** (both projects). `npm run build` → **exit 0**. The tree was clean
before and after; `dist/` and `dist-electron/` are gitignored. No Thai literal exists outside
`th.ts` in any of the 8 files — the only two hits are doc comments quoting the human's own answers,
which PROTOCOL allows.

### E. What is NOT proven, and stays that way

**N-SA-1 is genuinely open and Fern was right not to tick it** (Q-FE-6, ruled below). Everything
*downstream* of that `Uint8Array` is asserted; the crossing itself is not. Also unproven by anyone
here: **B14** (the real picker offering JPG/PNG) and **B3** (a photo actually *looking*
centre-cropped and undistorted), plus TASK-007's **B12 + B9**. Nobody in this team has a screen.

### F. Two observations, neither of them a rework

- **N-SA-4.** `UseTemplateSlotPanel` revokes the extras of a `multiple: false` pick. I checked the
  seam: `image:pick` returns `canceled` when `filePaths` is empty and opens the dialog without
  `multiSelections`, so `picked` always carries exactly one file and that branch is unreachable.
  It is three lines with their reasoning written beside them and it keeps "never leak one" true by
  construction, so I am leaving it — but naming it here so nobody later reads it as evidence that
  the seam *can* return more than one file. It cannot.
- **N-SA-5.** The DoD line "add a one-line comment in the test naming `Q-SA-5`" is satisfied inside
  Fern's probe, which lives in a scratchpad: this project has no test runner and no TASK has ever
  added one. That is correct as things stand. When Q-SA-5 flips it is one condition in `photo.ts`,
  not a hunt through committed tests.
