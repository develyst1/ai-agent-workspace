# TASK-010: Refusal message must render slot names literally (N-SA-6)
- Source: SPEC-002
- Status: DONE
- Owner: **Fern (FE)**
- Depends on: none (TASK-009 is `DONE` and accepted; this is **not** a rework of it)

Fixes the defect recorded as **N-SA-6** in TASK-009 §Review F. Priority go-ahead from the
human via Porter, REQ-002 §Questions **Q22** — *"แก้เลย"* (fix now, not parked). The batch
this was going to ride with no longer exists (Q21 dropped the dark-mode TASK), so it
travels alone. No requirement and no acceptance criterion moves.

## 0. The defect, measured — not theorised

`src/components/UseTemplateView.tsx:196` fills the one `{slots}` placeholder with a
**string** replacement:

```tsx
{th[message.key].replace('{slots}', message.slots ?? '')}
```

`String.prototype.replace` interprets `$` patterns **in the replacement value**, so a slot
name the user is allowed to type today mangles the refusal message. I ran these
(Node, `error.requiredSlotEmpty` = `ยังมีช่องที่ต้องใส่รูปว่างอยู่: {slots}`):

| slot name | renders today | correct |
|-----------|---------------|---------|
| `A$&B` | `...อยู่: A{slots}B` | `...อยู่: A$&B` |
| `X$'Y` | `...อยู่: XY` | `...อยู่: X$'Y` |
| ``P$`Q`` | `...อยู่: Pยังมีช่องที่ต้องใส่รูปว่างอยู่: Q` | ``...อยู่: P$`Q`` |
| `N$$M` | `...อยู่: N$M` | `...อยู่: N$$M` |
| `ปกติ, ช่อง 2` | correct already | unchanged |

It is **reachable through the app's own UI**: the designer's only rename rules are *blank*
and *duplicate* (`src/store/designerStore.ts:147-158`, `shared/contract.ts:220-243`) —
neither excludes `$`. Reach is exactly this one refusal message: no crash, no wrong file,
nothing on the export path, so it is cosmetic — but it is wrong text on screen.

## 1. What to do — one line, one file

In `src/components/UseTemplateView.tsx`, at the single `role="alert"` render site, pass a
**replacer function** instead of a string:

```tsx
{th[message.key].replace('{slots}', () => message.slots ?? '')}
```

A function replacement is never scanned for `$` patterns, so the value lands verbatim.
It is still **one `String.replace` at render time**, which is what SPEC-002 §7 / SA call
**B-9** and SPEC-001's "nothing branches on a message's text" rule care about.

Also update the `UseTemplateMessage` doc comment a few lines above (currently
"one `String.replace` at render time") so it names the **function** form and says why in
one clause — otherwise the next reader tidies it straight back to the broken form.

**Nothing else moves.** No new string, no `th.ts` change, no store field, no new state, no
second file, no change to `UseTemplateSlotPanel`'s `onMessage` prop.

### Explicitly out of scope — do not do these

- Do **not** switch to `replaceAll`, a regex, or a hand-written `$` escaper. There is
  exactly one `{slots}` in the whole table (TASK-009's C1 asserts that), and the replacer
  function is the entire fix.
- Do **not** add validation that bans `$` in slot names. Whether the designer should
  restrict slot names is a Requirement question for Porter, not a call either of us makes
  here.
- Do **not** touch anything on the Generate / export path.

## 2. Definition of Done

- [x] The one-line change above, at that one site, and nowhere else in the file.
- [x] The `UseTemplateMessage` doc comment names the function form and why.
- [x] **Render assertions**, in the probe-B style you already use (real component, shimmed
      hooks): with `message = { key: 'error.requiredSlotEmpty', slots: <name> }` the single
      `role="alert"` node's text equals `ยังมีช่องที่ต้องใส่รูปว่างอยู่: ` + `<name>`
      **verbatim**, for all five names in the §0 table plus a two-name join (`A$&B, ปกติ`).
      No literal `{slots}` survives in any of them.
- [x] **Negative control**: with the old string form restored, each of the four `$` names
      fails that assertion (the probe bites) — applied to the real file and reverted, the
      way you did TASK-009's 20 regressions.
- [x] The other five `UseTemplateMessageKey` values (no placeholder, `slots` undefined)
      render **byte-identical to `th[key]`** — the `?? ''` fallback still changes nothing
      for them.
- [x] `npm run typecheck` → 0. `npm run build` → 0.
- [x] Hand-off packet recorded per SPEC-001 §10. **Base `b9389e1`** (I checked read-only:
      tip `b9389e1`, tree clean, holding exactly TASK-009's three packet files with all
      three sha256 matching — so this is **not** a stacked hand-off). One file, under
      `src/`, nothing outside it. **No git write of any kind.**

## Implementation Notes

*(Fern, 2026-08-23)*

### What changed — 1 file, 2 hunks, nothing else

Base is the real commit **`b9389e1`** and the tree was **clean** when I started, so this is
**not** a stacked hand-off and the whole diff below is this task's own work.

| File | Change |
|------|--------|
| `src/components/UseTemplateView.tsx` | (1) the single `role="alert"` render site now passes a **replacer function**: `th[message.key].replace('{slots}', () => message.slots ?? '')`. (2) the `UseTemplateMessage` doc comment above it names the function form and why. |

`src/i18n/th.ts`, `UseTemplateSlotPanel`, the store, `shared/`, `electron/` and the whole
Generate/export path are **untouched**. No new string, no new state, no second `replace`, no
`replaceAll`, no regex, no `$`-escaper, and **no slot-name validation** — all four are on your
out-of-scope list and I stayed off them.

The doc comment runs to four lines rather than the "one clause" you asked for, because naming
all four `$` forms is what stops the next reader tidying it back; say the word at review and
I will cut it to one.

### Verification — 47 assertions, 47 passed, 3 regressions, 3 caught

`npm run typecheck` → **exit 0**. `npm run build` → **exit 0** (renderer 462.42 kB, plus
`main.js` and `preload.js`).

**Probe-B style, and I will state its limit first: there is no DOM and no React renderer
here.** `UseTemplateView` is *called* as a plain function against shimmed hooks (`useState`
returns a probe-supplied value and records every setter call; `useSyncExternalStore` returns
`getSnapshot()`, so the real zustand store is read; react-konva becomes named markers), and the
returned element tree is walked for nodes with `props.role === 'alert'`. So what is asserted is
**the string the component hands React**, not pixels in a window — React renders a string child
verbatim, so the step from one to the other is sound, but it is a step I did not observe.
Entry file, shims and bundle live in this session's scratchpad; **nothing was added to the
tree** (the packet below is the proof).

| Block | What was asserted | Result |
|-------|-------------------|--------|
| **C0 — the oracle** | The expected prefix is the literal `ยังมีช่องที่ต้องใส่รูปว่างอยู่: ` written independently in the probe, and `th['error.requiredSlotEmpty']` is asserted to equal **prefix + `{slots}`** — so a change to either side breaks the run rather than moving the goalposts. Exactly **one** `{slots}` in that string, and exactly **one** value in the whole `th` table contains a placeholder. | 3/3 |
| **C1 — no message** | `message = null` renders **no** `role="alert"` node at all. | 1/1 |
| **C2 — the §0 table, verbatim** | For `A$&B`, `X$'Y`, ``P$`Q``, `N$$M`, `ปกติ, ช่อง 2` and the two-name join `A$&B, ปกติ`: **exactly one** `role="alert"` node, its text **equals** prefix + the name byte for byte, the name appears **whole**, and **no literal `{slots}` survives**. | 24/24 |
| **C3 — the `?? ''` fallback** | `{ key: 'error.requiredSlotEmpty' }` with `slots` undefined → one alert node reading exactly the prefix, placeholder gone. | 2/2 |
| **C4 — the other five keys** | `error.loadFailed`, `error.fileUnreadable`, `error.photoUnreadable`, `error.photoLoadFailed`, `error.exportFailed` render **byte-identical to `th[key]`** — and still byte-identical when a stray `slots: 'A$&B'` is present, so the uniform `replace` changes nothing for them. | 16/16 |
| **C5 — purity** | A render calls **no** state setter. | 1/1 |

**Negative controls — 3 deliberate regressions, all 3 caught.** Each was written into the
**real** file, the probe re-bundled and re-run, and the file restored in a `finally`; the run
ends by re-hashing the file — **sha256 unmoved** (`ed0d7be87dc29260` before and after) — and by
re-running the probe green (47/47).

| Break | Failing assertions | Notes |
|-------|--------------------|-------|
| **M1 — the pre-fix string form** (the required control) | **12** | Reproduces your §0 table exactly: `A{slots}B`, `XY`, `Pยังมีช่องที่ต้องใส่รูปว่างอยู่: Q`, `N$M`; `ปกติ, ช่อง 2` passes, as your table says it should. |
| M2 — no `.replace` at all | 19 | The literal `{slots}` survives everywhere, C3 included. |
| M3 — replacer returns `''` | 12 | Catches a fix that is a function but drops the value. |

**One honest detail about M1, because it changes what the evidence is worth:** of the four `$`
names, only `A$&B` (and the join) leave a literal `{slots}` behind — `X$'Y` and `N$$M` mangle
*without* it. The "no literal `{slots}`" box alone would have missed two of the four; the
**verbatim-text** assertion is the one that actually bites, and it bit on all four.

### Hand-off packet (SPEC-001 §10)

- **Base**: `b9389e1` (`git rev-parse --short HEAD`); tree was clean at start, so no stacking.
- **Change set** (`git status --porcelain`, verbatim):

```
 M src/components/UseTemplateView.tsx
```

- **Fingerprint** (sha256, first 16): `src/components/UseTemplateView.tsx` → `ed0d7be87dc29260`

One file, under `src/`, nothing outside it. **No git write of any kind.**

## Questions

*(Fern asks here; Sober answers as `> answer: ...`)*

**Q-FE-9 — non-blocking, style only.** The doc comment is four lines, not the "one clause" the
TASK asks for (reason above). Trim it or keep it — either is a one-line edit for me.

> answer (Sober, 2026-08-23): **keep the four lines as they are — do not trim.** Your reason is
> the right one and it is the reason the comment exists: the next reader has to see *why* the
> function form is there, and "one clause" was my word-count guess, not a requirement. Naming the
> four `$` forms is what stops the tidy-up. No edit; the DoD box is ticked as met in substance.

## Review

*(Sober, 2026-08-23 — verdict: **DONE**. Accepted at base `b9389e1` + the 1-file packet.)*

### A. The packet, checked read-only before anything else was trusted

Tip `b9389e1`, `git status --porcelain` = exactly ` M src/components/UseTemplateView.tsx` —
one file, and sha256 `ed0d7be87dc29260…` matches the fingerprint in §Implementation Notes.
`git diff` is **2 hunks and nothing else**: the doc comment, and line 199. Not a stacked
hand-off. **No git write of any kind by me** — read-only commands only.

The four out-of-scope items hold, checked in the tree rather than taken on trust: `src/i18n/th.ts`
untouched and its only `{slots}` still the one in `error.requiredSlotEmpty`; no `replaceAll`,
regex or `$`-escaper anywhere (`designerStore.replaceAll` is an unrelated store action); no
slot-name validation added (`src/store/designerStore.ts`, `shared/contract.ts` unmoved); the whole
Generate/export path untouched. Repo-wide there is now **exactly one** `String.replace` on a §7
string — `UseTemplateView.tsx:199`, so **B-9 is intact**, not merely claimed.

### B. My own verification — 137 assertions, 137 passed

Not a re-run of Fern's harness: my own bundle, my own shims, my own oracle. The real
`UseTemplateView` is bundled from the working tree (esbuild, `react`/`react/jsx-runtime`/
`react-konva` replaced by recording shims, the **real** zustand store and the **real** `th.ts`
kept), called as a function, and the returned element tree walked for `props.role === 'alert'`.

| Block | Asserted | Result |
|-------|----------|--------|
| **A0 — oracle** | The prefix `ยังมีช่องที่ต้องใส่รูปว่างอยู่: ` is written in my probe, independently of `th.ts`, and `th['error.requiredSlotEmpty']` must equal prefix + `{slots}`; exactly one `{slots}` in that string and exactly one placeholder-bearing value in the whole table. | 3/3 |
| **A1** | `message = null` → **no** `role="alert"` node. | 2/2 |
| **A2 — verbatim** | For 13 names — the five from §0, the join `A$&B, ปกติ`, plus `$$$$`, `` $&$`$' ``, `$<n>x`, `$1$2`, `$`, `plain`, `  padded  ` — exactly one alert node, its child a plain string, **equal byte for byte** to prefix + name, and no literal `{slots}` left. | 104/104 |
| **A3** | `slots` undefined → the bare prefix; the `?? ''` fallback still holds. | 4/4 |
| **A4** | The other five keys render **byte-identical to `th[key]`**, and stay identical when a stray `slots: 'A$&B'` rides along. | 20/20 |
| **A5** | A render calls **no** setter, and the view has **exactly one** `useState`. | 4/4 |

Every block was run **twice — with an empty store and with a template loaded** — because the
alert sits in a toolbar whose other children are behind `template &&`; the message line must not
depend on that. It does not.

The join case is not decoration: production builds the value as `missing.join(', ')`
(`UseTemplateView.tsx:129`), so a two-name refusal is the *ordinary* case, not an edge one.

`npm run typecheck` → **exit 0**. `npm run build` → **exit 0**. And the built renderer bundle
contains `replace("{slots}",(` — the function form **actually ships**, it is not lost in
transform.

### C. Mutations — 6 written, 6 caught, 0 uncaught

All six were injected **in memory** (an esbuild `onLoad` hook returning mutated contents); the
repo file was never written. Its sha256 is `ed0d7be87dc29260` before and after, and the tree is
still that one modified file.

| Break | Failures | What it proves |
|-------|----------|----------------|
| **M1 — the pre-fix string form** | 20 | Reproduces §0 exactly: `A{slots}B`, `XY`, `Pยังมี…Q`, `N$M`. The control that matters. |
| M2 — no `.replace` at all | 54 | The placeholder survives everywhere. |
| M3 — replacer returns `''` | 26 | A fix that is a function but drops the value. |
| M4 — `() => message.slots` | 2 | The `?? ''` fallback removed → `…อยู่: undefined`. Only the undefined case moves, as it should. |
| **M5 — a `$`-escaper instead** | 20 | The mutation that *looks* like a fix (`…อยู่: A$$&B`). Caught, so the suite proves the value lands **verbatim**, not merely "not mangled". |
| M6 — `.trim()` on the value | 2 | A padded slot name is passed through untouched. |

### D. Fern's caveat, reproduced — the DoD box he flagged is necessary but not sufficient

Of M1's 20 failures, **14 are the verbatim-text assertion and only 6 are "a literal `{slots}`
survived"** — the latter fires only for names containing `$&` (`A$&B`, the join, and my
`` $&$`$' ``). `X$'Y`, `N$$M` and `` P$`Q `` mangle **without** leaving a placeholder behind. His
reading is right, and it is now on the record for whoever writes the next message TASK: **a
"no literal placeholder" check alone would have passed half this defect.** The verbatim
comparison is the assertion that carries the proof.

### E. Limits — mine as well as his

**There is no DOM and no React renderer in my harness either, and I did not add one.** What both
of us assert is *the string the component hands React*, not pixels in a window. React renders a
string child as text verbatim, so the last step is sound — but neither of us observed it. That
leaves exactly **one** thing worth a real screen, and it is in §F.

### F. One optional on-screen check — Porter's to include or drop

Non-blocking, and it does **not** change the nine checks in TASK-009 §Review G: in the designer,
name a slot `A$&B`, leave it required and empty, switch to Use Template and press `สร้างภาพ` —
the red line must read `ยังมีช่องที่ต้องใส่รูปว่างอยู่: A$&B` exactly. It is the only assertion
above that no harness of ours can make.

### G. Verdict

**DONE.** Nothing reworked, nothing carried over, no new note. The fix is one line, it is the
right line, and the evidence on both sides is stronger than the defect was. **N-SA-6 is closed.**
The packet sits **uncommitted** on top of `b9389e1` — the human's commit is all that is left, and
whether REQ-002 goes `DELIVERED` with or without this fix stays **Porter's ruling**, not mine.
