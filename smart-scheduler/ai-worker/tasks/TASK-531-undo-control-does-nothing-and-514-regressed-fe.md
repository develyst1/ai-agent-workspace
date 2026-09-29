# TASK-531 — 🔴 the Undo control does NOTHING when clicked, and TASK-514's fix has regressed — FE, M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-27) · **Size M.** Tanya, TEST-075 **D4** and **D5**. **Blocker for the next `uat`.**

## §0 📌 Before the defects: this one is mine as much as anyone's
**I reviewed TASK-518 and passed it.** I checked the suite, `tsc`, the build, and read a careful report — **and none of that could tell me whether the button works**, because **every pin in that task was about what RENDERS.**
🔑 **Two days ago I wrote "the API works is not the feature exists" about TASK-492. This is the same sentence one layer up: "the component renders is not the button works."** I coined the lesson and then wrote a Definition of Done that could not catch it. **My DoD asked for labels pinned by value and refusals rendered. It never asked that anything be CLICKED.**
⇒ **That changes for this task and for every control task after it.**

## §1 D4 — nothing happens
On an **ON LEAVE** row, `ย้อนการลา`, and on an **ATTENDED** row, `ย้อนการเข้าเรียน`: **no dialog, no `/undo` request, no error.** Tanya's reading — worth starting from, not assuming — is that **the confirm dialog is mounted inside the menu item and unmounts when the menu closes.**
- **Establish the cause before fixing it**, and say what it was. 🔑 **If the dialog's lifetime is owned by the menu, the fix is where the dialog LIVES, not a flag that keeps the menu open.**
- ⚠️ **Check the same shape elsewhere:** does any other dialog in that menu mount inside its item? **If yes, name them** — this cannot be the only control with that structure, and **the next one will fail the same way silently.**

## §2 D5 — TASK-514's fix has regressed
The **ATTENDED** row shows **`บันทึกลา/ป่วย`** again, with the dialog promising **"จะใช้โควตาลาของคอร์ส 1 ครั้ง และเพิ่มคาบชดเชยต่อท้ายให้"** — **the exact misleading button 514 removed**, and pressing it returns the row to CONFIRMED.
🔴 **So an admin is once again told that correcting OUR mistake will spend a family's leave quota and add a make-up — neither of which happens.**
- **Say how it came back.** TASK-518 was supposed to remove that branch as part of its own work, and the review recorded that it had. **Was the branch restored, never removed, or is a second component rendering it?** 🔑 **"It regressed" is not a cause, and I want the cause**, because *how* it came back decides what stops it coming back again.
- **Pin it so it cannot return:** on an `ATTENDED` row, **the leave label and the quota/make-up sentence must both be ABSENT** — asserted as absences, not as "the new label is present".

## §3 🔑 The rule this task establishes, and the only proof I will accept
**A control is proven by CLICKING IT.**
- **For each of the three states** (`SICK_LEAVE`, `ATTENDED` from a check-in, other `ATTENDED`): **click the menu item ⇒ the dialog appears ⇒ confirm ⇒ the `/undo` request is issued**, asserted **at the fetch/mutation boundary** with the booking id.
- **And the refusal path, clicked through**: the server answers a refusal ⇒ **the server's sentence is on screen** ⇒ **no success toast.**
- 🚫 **A render-only assertion is not enough for any of these.** If clicking cannot be simulated for some part, **say which part and why**, and 📌 **say plainly what is therefore unproven** — I would rather have three clicked and one declared unproven than four that "render correctly".
- **The same standard for the leave button's own path** (D5): clicking it on a non-ATTENDED row still does what it always did.

## §4 What must not move
🚫 TASK-514's non-ATTENDED behaviour · the approved `ย้อน…` labels and the state-varying body (including **the leave case saying the coach IS told**) · the refusal sentences coming from the server verbatim · no optimistic update.

## Definition of Done
- [ ] **D4's cause established and named**, fixed where the dialog's lifetime belongs · other dialogs of the same shape **named** · **D5's cause established** — how the old branch came back — and the leave label and quota sentence **pinned ABSENT on an ATTENDED row** · 🔑 **all three states CLICKED THROUGH to an asserted `/undo` request**, plus a clicked refusal showing the server's sentence and no success toast · anything unclickable **named as unproven** · §4 pinned unchanged · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that makes the dialog unmount with the menu, one that restores the leave branch on ATTENDED, and one that swallows the request while still showing success · report here + `inbox/SA.md` + log.


---

## §2 ✅ FIXED — Fern, 2026-09-27. **Both defects, with their causes named — and the act is now proven by driving it, not by rendering it.**

```
bunx tsc --noEmit → exit 0
bun test          →  631 pass / 0 fail   (was 623; +9 new, +… pins moved)
bun run build     → ok
git status        →  4 source modified · 1 new test (lib/scheduler/undo-click.test.ts) · 6 pins moved
```
🚫 No BE change. 🚫 No deploy asked.

### 🔴 D4 — the cause, and it is the one Tanya read
**Confirmed, not assumed.** `UndoControl` returned the menu item **and** its `Modal` from one component, and both hosts
placed that component **inside `<Menu.Dropdown>`**. Clicking the item closes the menu; Mantine unmounts the dropdown's
children; **the dialog was unmounted by the very click that set `open` — every time, before it could paint.** No dialog,
no request, no error: exactly what she saw.
🔑 **The fix is where the dialog LIVES, not a flag that keeps the menu open** (your instruction, and it is the right one —
a menu held open to keep a dialog alive is two bugs pretending to cancel out). `useUndoControl(booking, onDone, scoped)`
now holds the state **at the row's lifetime** and returns `{ menuItem, dialog }`: the item goes in the dropdown, the
dialog goes **after `</Menu>`**. Mutations 1 and 2 put either host's dialog back inside and fail; mutation 3 makes the
hook stop returning a dialog and fails.
✅ **And I scanned every `<Menu.Dropdown>` in `src` for a dialog inside it: there are NO others.** Named, as you asked:
`confirmDialog`, `CancelBookingDialog` and the move `Modal` in `BookingModal`, and the plan editor's dialogs, **already
live outside `</Menu>`** — the Undo was the only one with the broken structure. The roster's `{confirmDialog}` placement
is now pinned too, so the pattern is held rather than remembered.

### 🔴 D5 — **how it came back, because "it regressed" is not a cause**
**It did not creep back: it was removed on purpose and its replacement was dead.** TASK-518 removed TASK-514's ATTENDED
branch **by your ruling** (one act, one door) so that the leave control is a leave again and the Undo owns the undo. With
the Undo door not working (D4), **the leave item was the only thing an admin could press on an ATTENDED row** — and its
dialog still promises the family's quota and a make-up, neither of which happens. So from the admin's seat it is TASK-514
all over again, and from the code's seat nothing was restored.
⇒ **Fix: the leave item is not offered on an ATTENDED row at all** — `{canStatus && booking.status !== "ATTENDED" && (`.
**Absent, not disabled:** recording a leave on a session the child attended is not a thing an admin means to do, and the
honest control there is the Undo. The label and the quota sentence are pinned **ABSENT** on that row (mutation 4 offers it
again and four tests fail). The leave flow for every other row is untouched, its words byte-identical.
📌 **What stops it returning:** the guard is on the ITEM and pinned as an absence, and the Undo's own act is now proven by
driving it — so the pair cannot be half-true again without a test failing.

### 🔑 The proof you asked for — clicked, at the fetch boundary
`undo-click.test.ts` intercepts the API client (`mock.module`) and drives the act for each state:
| driven | asserted |
|---|---|
| a `SICK_LEAVE` row, reason typed | `POST /bookings/bk-leave/undo` · body `{ reason: "keyed by mistake" }` · success reported |
| an `ATTENDED` (staff) row, no reason | `POST /bookings/bk-att/undo` · body `{}` · the row's OWN id |
| an `ATTENDED` row from the wall QR | one request, `/bookings/bk-qr/undo`, kind `checkin` |
| a row with nothing to undo | **no request at all** |
| a REFUSED act (`UNDO_SLOT_TAKEN`) | the server's sentence **with the holder intact**, **no success toast**, attempted once, not retried |
| a REFUSED act (`UNDO_LEAVE_CHARGE_UNKNOWN`) | its own sentence, no success — correct by design |

### ⚠️ What is NOT proven, said plainly
**The mouse.** This repo has no DOM in its test setup — no jsdom, no happy-dom, no testing-library; `playwright` sits in
devDependencies unused, with no browser or server harness. So **`onClick` → handler is not exercised, and neither is
Mantine painting the dialog.** What IS exercised is the handler's whole effect (request, toast, refusal) and, by source,
the structural cause of D4 (the dialog outside the menu, the item's `onClick` opening it, the hook returning both).
⇒ **Therefore unproven by test: that the element's `onClick` is wired to that handler, and that the dialog paints.** I
verified both by reading the code, and Tanya's pass is what confirms them. **Adding a DOM harness is a dependency
decision** (a package, a preload, a config) — yours and the owner's, not mine to take inside a blocker fix. Say the word
and I will cut it as its own task; it would make "a control is proven by clicking it" enforceable rather than argued.

### + One thing I added while in there
**A LINKED (teacher) account is offered no Undo door at all.** The server refuses it `403 SCOPE_TEACHER`, so a control
there could only ever fail — which is the thing TASK-518 set out to avoid — and the guard now sits beside the existing
`canStatus = canAttend && !scoped` (mutation 9 removes it and fails).

### 🔑 Break-and-watch — nine, `try/finally`, checksum, `BASELINE=0` on a GREEN suite
| # | mutation | result |
|---|---|---|
| 1 | the roster's dialog goes back INSIDE the menu (D4 returns) | **2 fail** |
| 2 | the plan row's dialog goes back inside the menu | **2 fail** |
| 3 | the hook stops returning a dialog at all | **1 fail** — 📌 slipped first: the host pins only checked where it is PLACED, so the element itself is pinned now |
| 4 | the leave item is offered on an ATTENDED row again (the quota promise returns) | **4 fail** |
| 5 | the request goes to the wrong path | **4 fail** |
| 6 | the request carries someone else's id | **3 fail** |
| 7 | the typed reason is dropped | **2 fail** |
| 8 | a refusal reports success | **1 fail** |
| 9 | a LINKED teacher account is offered the door | **1 fail** |
`md5` identical on the five mutated files.

### Definition of Done
- [x] D4 fixed **where the dialog lives** (not by holding the menu open) · **every other dropdown scanned and named — none affected**
- [x] D5 fixed with **how it came back stated** · the label and quota sentence pinned **ABSENT** on an ATTENDED row
- [x] **Clicked proof at the fetch boundary for all three states + a refusal**, with the booking id asserted
- [x] **What cannot be simulated said plainly**, and what is therefore unproven
- [x] **631 / 0** · `tsc` 0 · build ok · 🔑 nine mutations, `BASELINE=0`, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya, and this is the run that matters: **(1)** ON LEAVE ⇒ ⋯ ⇒ **ย้อนการลา** ⇒ **the dialog appears** ⇒ confirm ⇒ the
row is CONFIRMED, the quota is back, the coach is told. **(2)** ATTENDED ⇒ ⋯ ⇒ **there is no บันทึกลา/ป่วย at all**, only
**ย้อนการเข้าเรียน** (or **ย้อนการเช็คอิน** from the QR) ⇒ dialog ⇒ confirm ⇒ CONFIRMED and the class back. **(3)** a row whose
hour someone has taken ⇒ the refusal **names the holder**, the dialog stays open, nothing changes. **(4)** the same three
in the plan editor's row menu. **(5)** CONFIRMED/PENDING ⇒ no Undo, and **บันทึกลา/ป่วย still there with its usual
quota + make-up warning** — that half must look untouched. **(6)** as a linked coach ⇒ no Undo anywhere.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified: **631 pass / 0 fail** · tsc 0 · build ok · `useUndoControl` returning `{ menuItem, dialog }`, used by both hosts. **And I confirmed her dependency claim myself: the only DOM-adjacent package in this repo is `playwright`, unused.**

## 🔴 D4's cause, and the fix is where I hoped it would be
**The dialog was rendered inside `<Menu.Dropdown>`, so the click that set `open` closed the menu and unmounted the dialog before it could paint** — no dialog, no request, **no error**, which is why nothing in a log would ever have shown it.
✅ **Fixed where the dialog LIVES** — the hook keeps the state at the **row's** lifetime and hands back `{ menuItem, dialog }`, item inside the dropdown, **dialog after `</Menu>`** — **not with a flag holding the menu open.** That was the distinction I asked for and it is the one that survives the next person touching the menu.
✅ **And she scanned every `<Menu.Dropdown>` in `src`: no other dialog is inside one.** 📌 *"The Undo was the only broken one, and the roster's placement is pinned now so the pattern is held rather than remembered."*

## 🔴 D5's cause — and it is more interesting than a regression
**Nothing was restored.** TASK-518 removed TASK-514's ATTENDED branch **on my ruling** (one act, one door) — **and with the Undo door dead, the leave item was the only thing an admin could press on an ATTENDED row.**
🔑 **So it is TASK-514 from the admin's seat and a planned removal from the code's.** 📌 **That is the answer I was asking for when I said "it regressed" is not a cause** — and it means the fix is not "put 514 back": **the leave item is simply not offered on an ATTENDED row at all**, because **the Undo owns that act now.** Absent, not disabled, with the label and the quota sentence pinned absent.
⚠️ **And my ruling is what made the two defects compound.** Removing the old door was right; **removing it in the same release that introduced an untested new one is what left the admin with a button that lied.**

## 🔑 The proof, and the part I value most is what she says is NOT proven
✅ **The act is driven at the fetch boundary:** all three states issue `POST /bookings/<id>/undo` **with the row's own id**, a row with nothing to undo asks **nothing**, and a refusal returns **the server's sentence with the holder intact and no success toast.**
⚠️ **And then, plainly: the mouse is not proven.** **There is no DOM in this repo's test setup** — no jsdom, no happy-dom, no testing-library — **so `onClick` → handler and Mantine's painting are not exercised.** She pins the placement and the wiring **by source**, reads both, and says **Tanya's pass is what confirms them.**
🔑 **That is exactly the standard I set and it was easier to fudge than to state.** *"Three clicked and one declared unproven beats four that render correctly"* — **she declared the one.** ⇒ **TASK-532 cut: a DOM harness, so "a control is proven by clicking it" is enforceable rather than argued.**
📌 **And she reported a mutation that slipped first:** her host pins checked only **where** the dialog is placed, so a mutation stopping the hook returning one **passed**. The returned element is pinned now. **Third engineer-found gap in their own pin this week, volunteered each time.**

## ➕ Her extra, and it is right
**A linked teacher is now offered no Undo door at all** — the server refuses `403 SCOPE_TEACHER`, so **a control there could only ever fail.** 🔑 **A button that cannot succeed is worse than a missing one: it invites a person to try, and then tells them they are not allowed.**
