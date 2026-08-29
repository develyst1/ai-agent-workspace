# TASK-191: The display toggle ticks but cells don't redraw — one shared source (FE)

- Source: Porter 2026-08-25 (owner on uat: *"มันติ๊กๆ แล้ว ทำไมไม่ refresh"*). 🟠 **Priority: normal** — no data/money
  wrong, the cells show the right content, they just don't respond live. REQ-052 follow-up.
- Status: **REVIEW** (Fern 2026-08-25 — single handler; the double-toggle was my line, and my own comment had already stated the invariant it broke)
- Repo: **smart-scheduler-front**.

## Root cause (grounded by Sober — read, not guessed)
**Answer to Porter's question: it PERSISTS but does NOT re-render.** `useCellDisplay` is called **twice, independently**
— once in `CellDisplayMenu.tsx:20` (where you tick) and once in `CalendarWeekGrid.tsx:51` (where the cells read
`display`). Each call is a **separate `useState`**. Toggling updates the menu's copy + writes `localStorage`, but the
grid's copy only reads `localStorage` in its mount `useEffect` (`lib/scheduler/cell-display.ts:26`), so it never sees
the change and the cells don't redraw. A reload *would* show the new setting (proof it persists). `localStorage` is not
reactive and `useState` is not shared across components — that's the whole bug.

## The fix — one `display`, both the menu and every grid subscribe
Make the toggle state a **single source** so a tick re-renders the cells:
- **Preferred: a small Context** (`CellDisplayProvider` + `useCellDisplay` reading context), mounted around the
  calendar — matches how the language toggle is shared, and both the menu and the grids read the same state. OR
- **Lift-and-prop:** call the hook once in the common parent (the calendar content/page) and pass `display` (+ `toggle`
  to the menu) down as props. Fine if the parent is right there and the tree is shallow.
- Keep the localStorage persistence + the merge-over-defaults exactly as-is; only the *sharing* is broken, not the
  storage. Check the **day grid** (`CalendarGrid.tsx`) too — if it renders `BookingCellBody`, it must read the same
  shared `display`, not a third instance.

## DoD
- [ ] Ticking an item in the menu **immediately** redraws the cells (no reload), in **both** week and day views.
- [ ] The preference still persists across reload and merges over defaults (no regression).
- [ ] Exactly ONE source of `display` state — no component calls `useCellDisplay()` as its own island.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · no raw key.

## Notes
(Fern fills in. This is the paired "must actually work" to the "must not filter bookings" check — Porter's brief tested
the negative, not the positive.)

---

## Implementation Notes (Fern 2026-08-25) — my bug, and your read was exactly right
You diagnosed it from the code without testing, and it was precisely that: `useCellDisplay` was a plain hook called
**independently** by the menu and by the grid, so each got its **own `useState`**. A tick updated the menu and
localStorage; the grid only read storage on mount and never heard about it. **Persistence without a shared source
looks like it works and doesn't** — which is why it survived my own check: I verified it *persisted*.

### Fix — one source, structurally
`cell-display.ts` → **`cell-display.tsx` with a `CellDisplayProvider`**, mounted once in `CalendarContent` around
**both** the header (which writes) and the grids (which read). Persistence is unchanged.

🔴 **`useCellDisplay` now THROWS without a provider** instead of quietly returning a private copy. A silent fallback
is exactly how the original bug hid — a component that "works" while disagreeing with everything else. Now that
mistake can't compile past a render.

Also **wired the day grid**, which had been rendering type/program/badge/note unconditionally — the toggle only ever
affected the week view. It reads the same Context, inside `Row` where the cells actually are.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** ·
`bun test src/lib/scheduler/ src/services/` **40/0** · one provider, and every `useCellDisplay()` resolves to it.
🔴 Rendered → @Tanya. **The check that would have caught this is the positive one:** tick a box and watch the *cells*
change, then reload and confirm it stuck — the persistence half was never broken.

---

## 🔴 REOPENED — read the MERGED tree, not the old fix (Sober 2026-08-25)
The owner reverted our code and merged a colleague's branch (commits `9cc8f19 fix display-toggle sync`,
`f4745a7 unify booking-cell layout`). **My earlier Context fix is not in the tree** and must not be re-applied.
Grounded against the current merged code:

**The store is now CORRECT and is NOT the bug.** `lib/scheduler/cell-display.ts` is a module-level store read via
`useSyncExternalStore` — one shared snapshot, every reader in lockstep, cross-tab sync for free. The old "doesn't
re-render at all" symptom is genuinely gone. Leave it.

**The remaining bug is a DOUBLE-TOGGLE in `CellDisplayMenu.tsx`** (lines 37/40):
```
<Menu.Item onClick={() => toggle(f)}>          // handler #1
  <Checkbox checked={display[f]} onChange={() => toggle(f)} ... />   // handler #2
```
One physical click on the checkbox/label fires **both** — the Checkbox `onChange` AND the click bubbling to the
`Menu.Item onClick` → `toggle(f)` runs **twice** → value flips then flips back → **net zero, nothing happens.** Click
the row's padding instead → only `Menu.Item onClick` fires → one toggle → it works. **That position-dependence is the
"กดได้บ้างไม่ได้บ้าง ปุ่มเดิมด้วยซ้ำ" the owner reports**, and it's why waiting/slow-clicking never helped (a parity
bug, not a race).

### The fix — one handler per click
The comment on line 43 already states the intent ("the row toggles; the box is the affordance"). So keep the **row**
as the single toggle and make the Checkbox **presentational**:
- `Checkbox`: `checked={display[f]}` + **`readOnly`**, and **remove `onChange`** (readOnly avoids React's
  controlled-without-onChange warning; the box now only *shows* state, never sets it).
- `Menu.Item onClick={() => toggle(f)}` stays as the one toggle for the whole row.
Result: one click = exactly one `toggle`, anywhere on the row.

### DoD (verify against the owner's EXACT repro, not a theory)
- [ ] Open `สิ่งที่แสดงในช่อง`; click a box → toggles. Click again **in place** → toggles. Repeat rapidly → every
      click toggles. No need to move the pointer away. Both directions, every one of the five.
- [ ] Cells redraw on each toggle (the store already does this); the preference still persists + merges over defaults.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · no raw key.
- [ ] Rendered confirm rides @Tanya against the owner's 3-step repro.

### One honest flag
The double-toggle fully explains the *position-dependent* intermittency. If, after collapsing to one handler, any
*pointer-move-to-re-enable* residue truly remains (Mantine Menu hover reconciliation), that is a **separate, narrower**
issue — chase it THEN, against the repro, not now. But this is almost certainly the whole of it.

---

## Fix (Fern 2026-08-25, reopened) — your diagnosis was right, and it was my line
`CellDisplayMenu` had **two** handlers for one click: `Menu.Item onClick={() => toggle(f)}` **and** the child
`Checkbox onChange={() => toggle(f)}`. Clicking the box or its label fired both → `toggle` ran twice → **net zero**;
clicking the row's padding missed the checkbox and fired once → worked. That parity behaviour is exactly the owner's
*"กดได้บ้างไม่ได้บ้าง ปุ่มเดิมด้วยซ้ำ"*, and it's why waiting never helped — **nothing settles in the background in a
parity bug**, so Porter's race theory could not have been right.

🔴 **The part I want on the record:** the comment I left on that very line already said *"the row itself toggles; the
box is the affordance, **not a second control**"*. I wrote the intent correctly and then contradicted it in the code
one line above. A comment asserting an invariant the code breaks is worse than no comment — it's what made this read
as correct in review.

**Fix:** exactly one handler. The row's `onClick` stays the single toggle; the `Checkbox` is `readOnly` (keeps it
controlled, no second handler, no React uncontrolled-input warning). Verified there is now **one** `toggle(f)` in the
file.

**On the tree:** I diagnosed and fixed the **merged** tree, not my memory — the colleague's `useSyncExternalStore`
store (`9cc8f19`) is what's there now and it is the better fix for the re-render half; I re-applied nothing of my
Context version.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · `grep -c "toggle(f)"` = **1**.
🔴 **The repro to run is the owner's:** click the same row **twice in place without moving the pointer**, hitting the
checkbox itself (not the padding) — that is the path that used to net zero.
