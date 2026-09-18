# TASK-362 — Advance leave on `Extended` rows — FE (`REQ-089 item 1`) · + the tick-menu overlap · + resume default shows the LAST teacher

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-16)
**Contract (agreed with @Jason, TASK-361, building in parallel):** *`absentWeeks` may name ANY row of the previewed plan by its 1-based position, make-up rows included; a row exists iff the live rows before it number fewer than `size`; a ticked make-up comes back from the preview as `absent: true, makeup: true` and the server appends another make-up for it. The cap `distinct absences < size` stays.*
**Size S–M.** ⛔ Chain stopped. Ships with TASK-361.

---

## §1 Unlock
`CreatePlanFlow.tsx` — the tick toggles `weekIndex` (`:183`) and, I expect, only for chain rows. **Every row of the previewed plan is tickable, `Extended` included; the index is the row's position in the plan the server returned (1-based), not `i < size`.** Status rendering (`:153`) must show a ticked make-up as `SICK_LEAVE` (absent wins over makeup). Re-preview on every toggle as today, so the appended make-up appears.
🚫 No client-side existence rule — the server refuses; show its sentence. The cap message is the server's too.

## §2 The tick menu overlaps rows (@Tanya, `sid`)
The tick menu's portal overlaps the rows beneath it, so she used the API. **Find the cause (a `Menu`/`Popover` with `withinPortal` + a scroll container? `zIndex`?) and fix it in the ONE place; state what it was.** If it is a Mantine default that bites every menu in a `Modal`, say so — one fix for all, or name it on the list.

## §3 Resume default = the LAST session's teacher
TASK-361 moves the server's absent path to `rows.at(-1)`. Your dialog's pre-selected default must be that teacher (you said it is in hand); `teacherId` still rides only when changed. Rewrite the TASK-360 assertion that pinned "first".

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] Tick a make-up row ⇒ request carries its position; preview re-renders with one more make-up; untick restores — asserted on the request shape
- [ ] §2 cause named; the menu no longer overlaps (say how you checked)
- [ ] §3 default = last teacher where it applies
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ After the lock goes, what does the table LOOK like at 3 ticks on a size-4 — is the plan still readable on a phone-width admin screen? Say, do not fix.

---

## §4 ✅ IMPLEMENTED — Fern, 2026-09-16. **Every previewed row tickable by position; the tick menu shielded; the resume default is the LAST teacher.**

```
bunx tsc --noEmit → exit 0
bun test          →  345 pass / 0 fail   (was 341; +4 — new plan-tick.test.ts; one TASK-360 pin rewritten)
bun run build     → ok
git status        →  5 modified (PlanModal · CreatePlanFlow · scheduler.service · types/scheduler · resume-teacher.test)
                     · 1 new (lib/scheduler/plan-tick.test.ts)
```
🚫 No client-side existence rule, no client-side cap, no new dictionary key. Built against TASK-361's one-sentence
contract (BE in parallel): *any row by 1-based position; a ticked make-up returns `absent: true, makeup: true`; the
server appends a make-up for it; the cap stays the server's.*

### `§1` — the unlock: the index is the row's POSITION in the plan the server returned
- **`PlanModal.weekIndexOf`** was `i >= 0 && i < courseSize ? i + 1 : 0` (TASK-148's lock — make-up rows were "not a
  declarable week"). Now **`i >= 0 ? i + 1 : 0`** — the row's position in `sessions` (the draft, in the server's own
  order), make-ups included; `courseSize` is gone from the file. The TASK-148 comment is rewritten with the reversal
  and its reason, not deleted. The action is offered on every found row (the `=== 0` guard now means only "not in
  the plan"); the undo wording unchanged.
- **A ticked make-up renders `SICK_LEAVE`** — `CreatePlanFlow` already had absent-before-makeup precedence
  (`s.absent ? SICK_LEAVE : s.makeup ? EXTENDED : PENDING`); now pinned, with the contract line beside it; mutation 2
  (makeup wins) fails. The server's extra make-up appears as one more `EXTENDED` row because the preview re-runs on
  every toggle exactly as before.
- **Request shape, asserted:** `toggleAbsent` adds/removes the position and re-previews with `absentWeeks: weeks.length
  ? weeks : undefined`; the echo (`p.absentWeeks ?? weeks`) wins; **no `size`/`length <`/`makeup` in the toggle** —
  existence and the cap are the server's, and a refusal is its sentence via `runPreview`'s existing handler.
  Mutation 3 (a client cap) fails. The two `absentWeeks` type comments now say "row positions, make-ups included".
- Untick restores: the same toggle removes the position and re-previews — the server returns the plan without that
  absence and its make-up; nothing client-side to undo.

### `§2` — the tick menu: cause named, fixed once, checked by rendering
**Cause:** a Mantine default, not this table. `Menu` (via `Popover`) closes on `mousedown` / `touchstart` OUTSIDE its
dropdown (`clickOutsideEvents`) and **does not consume that event.** The row dropdown is `bottom-end`, so it lies
over the NEXT row — whose own `⋯` is ~40 px below the tapped one, exactly under the dropdown's edge. A tap that lands
beside the item (or on that next `⋯`) closes menu A on `mousedown` and, with the same tap, opens menu B; the next tap
ticks row B. That is @Tanya's *"portal overlaps the next row; two attempts toggled the wrong row"* — the portal is
Mantine's default (`withinPortal: true`, z 300 over the modal's 200) and is not itself the problem; the click-through
is. **Fix, in the ONE place (`SessionActions`):** `withOverlay` with `overlayProps={{ backgroundOpacity: 0.05, zIndex:
299 }}` — a full-screen click shield mounted with the dropdown, above the modal (200) and below the dropdown (300), so
a tap outside closes the menu and reaches nothing else. Faint on purpose: a shield, not a dialog.
**How I checked without a browser:** rendered the `Menu` OPEN with the exact props (portal off so SSR can see it) and
read the HTML — a `mantine-Menu-overlay` / `mantine-Overlay-root` element with `--overlay-z-index:299` and
`--overlay-bg:rgba(0,0,0,0.05)` mounts alongside the dropdown. Pinned as a rendered assertion; mutation 4 (shield
off) fails. ⚠️ What it does on a real phone — the closed-with-one-tap feel — is @Tanya's re-test.
📌 **Every other `Menu` in a modal shares the default** (`BookingModal` actions, `TeacherRowActions`, `CellDisplayMenu`);
only the plan table stacks a column of identical targets directly under its dropdown, which is why it bit here. If
the same click-through is ever seen elsewhere, the fix is the same two props — or `withOverlay` in the theme's `Menu`
defaults, one line for all. Named, not done.

### `§3` — the resume default is the LAST course row's teacher
`PlanModal`: `courseLastRow = [...sessions].reverse().find(non-extra) ?? sessions.at(-1)` — the same set as
`courseSlot` (the plan is in date order), read from the other end — feeds `courseTeacherId`; the subject still comes
off the slot row (one course, one subject). TASK-360's pin *"first"* is REWRITTEN with the reason (TASK-361 moved the
server's absent path to `rows.at(-1)`, and the default must be what the server writes when nothing is sent); mutation
5 (first again) fails. `teacherId` still rides only when changed — untouched, still asserted.

### 🔑 Break-and-watch — five mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the `< size` lock back in `weekIndexOf` | **1 fail** |
| 2 | makeup wins over absent in the draft status | **1 fail** |
| 3 | a client-side cap in `toggleAbsent` | **1 fail** |
| 4 | the click shield removed | **1 fail** |
| 5 | the resume default back to the FIRST row | **1 fail** |
`md5` identical on both mutated files.

### Definition of Done
- [x] **345 / 0** · `tsc` 0 · build ok
- [x] Tick a make-up ⇒ its position on the wire; preview re-renders with the server's extra make-up; untick restores —
      asserted on the request shape and the toggle
- [x] §2 cause named (Mantine's non-consuming click-outside + a `bottom-end` dropdown over the next row); fixed with a
      click shield; checked by rendering the open menu
- [x] §3 default = the last course row's teacher; TASK-360's pin rewritten
- [x] 🔑 Break-and-watch — five, `finally`, checksum

### ⚠️ Not seen on a screen
The shield's feel (one tap closes, nothing else happens) and the 7-row plan after three ticks. Both are one
`sid` pass for @Tanya via you: tick rows 2/3/4 on a size-4 by the UI only, then tick the first make-up ⇒ the server's
sentence (cap), untick ⇒ the make-up row disappears.

## Question — **what does the table look like at 3 ticks on a size-4, on a phone-width admin screen?** ⚠️ owner's list
**Seven rows, and the part that changed is off-screen at rest.** The cap (`distinct absences < size`) makes 3 the
maximum on a size-4 ⇒ 4 chain rows + 3 make-ups = 7 rows, three of them `SICK_LEAVE`, three `EXTENDED`. Rows are not
the problem — 7 fits a phone vertically. **Width is:** the table sits in `StickyScrollArea minWidth={640}` inside
the modal, with only the ACTION column pinned (`data-pin="action"`); the columns are Date · Time · Teacher · Subject ·
**Status** · ⋯. On a 375-px phone the viewport shows roughly Date + Time and the pinned `⋯`; **Status — the one column
the ticks change — is under the horizontal scroll, and so is the make-up's `EXTENDED` chip.** An admin who ticks a row
sees the row count grow and the end-date line change but not WHICH row became a leave unless they scroll right. *It
was already so before this task; three ticks on a size-4 just makes it the everyday case.* Options, named not built:
pin the Date column as `lead` (the CSS already supports `data-pin="lead"`, unused here) so date + status read together,
or move Status next to Date. 🚫 Say, not fix — said.
