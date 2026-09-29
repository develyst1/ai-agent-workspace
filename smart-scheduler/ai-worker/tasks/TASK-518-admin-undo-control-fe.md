# TASK-518 — 🔴 there is NO admin Undo control anywhere: build it — FE, M. **TASK-517 folds in.**

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-27) · **Size M.** Found by Tanya (TEST-075 B) via @Porter.

## §0 📌 This is my planning miss, and it is the biggest one of the round
**TASK-492 shipped the Undo API. I never cut its FE task.** My own sizing said *"Undo BE M–L + FE M"* — and then I cut eleven other things and never came back to the FE half. **TASK-517 is labels for a control that does not exist**, which is why it reads oddly: I was refining the wording of something nobody can press.
🔑 **Without this, the owner's feature — the one he was impatient about, the one three rulings and a migration went into — cannot be used at all.** Tanya found it by opening the ON LEAVE menu and seeing Overbook / Record leave / Pause / Cancel, then grepping the repo and finding no undo route and no undo action.
📌 **And the general lesson is mine to carry: a BE task and its FE task are one deliverable.** I marked TASK-492 DONE on a green suite and a verified endpoint. **"The API works" is not "the feature exists".**

## §1 What to build — one control, two places
- **The Undo control appears on the session roster AND in the plan editor**, wherever a row can be undone.
- 🔑 **Labels driven by the ROW'S STATE** (owner-approved, TASK-517's copy folded in here):
  - `ATTENDED` ⇒ **`ย้อนการเข้าเรียน` / `Undo attendance`**
  - `ATTENDED` from a check-in ⇒ **`ย้อนการเช็คอิน` / `Undo check-in`**
  - `SICK_LEAVE` ⇒ **`ย้อนการลา` / `Undo leave`**
  - anything else ⇒ **no control at all.** Not a disabled one — **there is nothing to undo, and a greyed button invites a question we cannot answer.**
- **The verb is `ย้อน…`, never `ยกเลิก…`** — that is `ยกเลิกการจอง`'s verb, and **Cancel takes a session off the schedule while Undo puts one back.** The owner asked that those two never blur.
- **The dialog body varies with the state**, and 🔴 **the leave case must say the coach IS told** (TASK-508 sends "class on again"); the attendance and check-in cases say nobody is told. **Shipping "nobody is told" on a leave row would be the same defect this control exists to remove.**
- **It calls TASK-492's endpoint** (`POST /api/bookings/:id/undo`), gated by its own permission key — 🔑 **and a user without that key sees no control**, not a control that fails.

## §2 🔑 The refusals are the hard half — design them first
The server refuses with named reasons. **Each must reach the admin as a sentence they can act on**, not as a generic failure:
- **the day-end has settled the day** ⇒ the day is closed; this cannot be undone here;
- **the coach's hour has been re-booked** ⇒ **the server names the obstacle and who holds it — show that**, because it is the only version an admin can do something about;
- **the leave's charge is unknown** (`UNDO_LEAVE_CHARGE_UNKNOWN`, an old row from before we recorded it) ⇒ say that plainly: *we cannot tell whether this leave used the family's quota, so it will not be undone automatically.* 📌 **That refusal is correct by design and must not read as a bug.**
- **a repeat** ⇒ the server changes nothing twice; the screen must not claim a second success.
🚫 **No optimistic update.** Nothing changes on screen until the server has answered — **this moves money.**

## §3 What I will be checking
- **Both surfaces**, pinned. **The three labels by state**, pinned by value. **No control where there is nothing to undo**, asserted as an absence.
- **Each refusal rendered with the server's own reason**, pinned — 🔑 including that **the re-booked-hour case shows who holds it.**
- **TASK-514's ATTENDED branch on the "Sick leave" button is REMOVED as part of this task** — that was your own recommendation and my ruling: **one act, one door, the stronger safety.** ⚠️ **Two buttons that both undo an attendance is the thing we agreed to avoid, and this is the task that must avoid it.**
- Copy counted, both languages, the approved words.

## Definition of Done
- [ ] The control on the roster **and** the plan editor · three state-driven `ย้อน…` labels, **no control where nothing is undoable** (asserted) · the body varying by state with **the leave case saying the coach IS told** · every refusal rendered with the server's reason, **the re-booked hour naming its holder** · **TASK-514's ATTENDED branch removed** · no optimistic update · permission-gated with no control when ungranted · copy both languages · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that shows a success after a refusal, one that renders a generic error instead of the server's reason, one that leaves the old ATTENDED branch in place, and one that says "nobody is told" on a leave row · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-27. **The Undo can be pressed now — one control, two surfaces, and TASK-514's second door removed in the same task.**

```
bunx tsc --noEmit → exit 0
bun test          →  620 pass / 0 fail   (was 614; +6 new, −5 from the replaced TASK-514 file, +5 elsewhere)
bun run build     → ok
git status        →  3 new (lib/scheduler/undo.ts · components/common/UndoControl.tsx · lib/scheduler/undo-control.test.ts) · 7 source modified · 1 test file replaced · 17 pins moved
```
TASK-517 folded in. 🚫 No BE change. 🚫 No deploy asked.

### `§1` — one control, two surfaces
- **`UndoControl`** (in `components/common/`, because two areas mount it): a menu item + its dialog, on the **session
  roster's modal** and the **plan editor's row menu**. One component, one rule, one dialog — a second surface cannot
  drift from the first (mutation 11 removes the plan editor's and fails).
- **The label is the row's state** (pure `undoKind`): `SICK_LEAVE` ⇒ **ย้อนการลา** · `ATTENDED` **from a check-in channel** ⇒
  **ย้อนการเช็คอิน** · any other `ATTENDED` ⇒ **ย้อนการเข้าเรียน** · anything else ⇒ **null, and the component renders nothing
  at all.** Absent, never greyed (mutations 6, 9).
- 📌 **"From a check-in" is a CLOSED set on purpose** (`shopfront-qr` · `checkin-qr` · `line`): `checkinSource` is
  open-ended today — a staff check-in carries an admin's USERNAME (TASK-482) — so anything outside the set reads as the
  general *attendance* wording. Both labels lead to the same act, so **the general word is the safe default** (mutation
  8 trusts any non-empty value and fails). ⚠️ **TASK-488's `checkinChannel` is exactly the closed set this wants** — when
  it lands, this list becomes that field's and the guess disappears.
- 🔴 **The verb is `ย้อน…`, never `ยกเลิก…`** — pinned as an absence across the whole `undo` copy block, so nobody can
  reintroduce `ยกเลิก` and blur Cancel (takes a session off the schedule) with Undo (puts one back) — mutation 5.

### 🔴 The body varies with the state, and the leave case says the coach IS told
One table, keyed by kind (`UNDO_BODY_KEYS`). The attendance and check-in bodies end *"nobody is told"*; **the leave body
says the quota comes back, its make-up is cancelled, and the coach is told the class is on again** (TASK-508). Both
directions are pinned, in both languages: a leave body claiming nobody is told fails (mutation 4), and an attendance body
claiming the coach is told fails too. 📌 That was the owner's catch on my TASK-514 draft, and it would have shipped the
very defect this control exists to remove.

### 🔑 The refusals — designed first, as you asked
The dialog's error slot shows **the server's own sentence, verbatim**, and **no refusal code appears in the component at
all** (pinned): so `UNDO_SLOT_TAKEN` arrives with the hour **and who holds it** — the only version an admin can act on —
and `UNDO_LEAVE_CHARGE_UNKNOWN` reads as the deliberate thing it is rather than a bug. **A refusal cannot render as a
success:** the toast is reachable only after the `await` resolves, the `catch` sets the sentence **and nothing else** (no
close, no toast, no local change — mutations 1, 2), and nothing typed is lost. 🚫 **No optimistic update:**
`invalidateAll` on success only, and the component never touches the cache or the row (mutation 10).

### 🔑 TASK-514's ATTENDED branch is REMOVED, in this task
Your ruling and my own recommendation: **one act, one door, the stronger safety.** The "Sick leave" control is a leave on
every row again, with its original words **byte-identical** (pinned by exact text, both languages), and the superseded
draft keys (`confirmAction.undoAttended*`, `booking.undoAttended*`) are deleted — the `defaultRateLine` precedent.
**Exactly one `<UndoControl>` exists in the roster modal** (mutation 3 leaves a second door and fails).

### The key, and one thing I changed my mind about mid-build
`action:calendar.undo` is the 60th key, **in the BE's slot** (immediately after `calendar.teacher-leave`,
`permissions.ts:84`) — pinned by position, and moving it fails **16** tests. 📌 I first wrote the door as
`can(UNDO_KEY)` using the constant, and the action sweep then listed `calendar.undo` among *"keys with no FE site"* — a
perfectly wired door the sweep could not see. **The site now says its key out loud, like every other site**, with the
reason in the code; the constant stays for the pure rules. A pin that cannot see a door is worse than a verbose site.

### 📝 What is still a draft
Only the **toast** (`undo.done` — *"Undone" / "ย้อนรายการแล้ว"*), marked `📝 DRAFT (Fern, TASK-518)` in both languages, and
**the marker mutation is kept** (removing it fails). Everything else in the block is the owner's approved wording.

### 🔑 Break-and-watch — twelve, `try/finally`, checksum, `BASELINE=0` on a GREEN suite
| # | mutation | result |
|---|---|---|
| 1 | a success is shown after a REFUSAL | **1 fail** |
| 2 | a generic error replaces the server's reason | **1 fail** |
| 3 | TASK-514's ATTENDED branch left in place (two undo buttons) | **1 fail** |
| 4 | the LEAVE body says nobody is told | **1 fail** |
| 5 | the verb becomes `ยกเลิก…` (Cancel and Undo blur) | **1 fail** |
| 6 | a control appears where nothing is undoable | **2 fail** |
| 7 | the door ignores the key | **1 fail** |
| 8 | a staff username reads as a check-in | **1 fail** |
| 9 | the control is disabled instead of absent | **1 fail** |
| 10 | the undo patches the row locally (optimistic) | **1 fail** |
| 11 | the plan editor loses its control | **1 fail** |
| 12 | the 60th key leaves the BE's slot | **16 fail** |
`md5` identical on the seven mutated files. **17 pins moved:** fifteen snapshot counts 59 → 60 (each carrying
`/* TASK-518: + the 60th, \`calendar.undo\` */`) and the sweep's 102/38 → 103/39.

### Definition of Done
- [x] The control on the roster **and** the plan editor · three state-driven `ย้อน…` labels · **no control where nothing is undoable** (asserted)
- [x] The body varying by state with **the leave case saying the coach IS told** · every refusal the server's reason, the re-booked hour naming its holder
- [x] **TASK-514's ATTENDED branch removed** · no optimistic update · permission-gated with no control when ungranted
- [x] Copy both languages · **620 / 0** · `tsc` 0 · build ok · 🔑 twelve mutations, `BASELINE=0`, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya, and please try the refusals first: **(1)** an ON LEAVE row ⇒ the menu shows **ย้อนการลา**; press ⇒ the dialog
says the quota comes back, the make-up is cancelled **and the coach is told**; confirm ⇒ the row is CONFIRMED, the quota
is back, and the coach gets "class on again". **(2)** a row whose hour someone else has since taken ⇒ the refusal names
**the hour and who holds it**, the dialog stays open, the row is unchanged. **(3)** an OLD leave from before we recorded
the charge ⇒ *"we cannot tell whether this leave used the family's quota…"* — **that is correct, not a bug.** **(4)** an
ATTENDED row from the shop QR ⇒ **ย้อนการเช็คอิน**; one marked by staff ⇒ **ย้อนการเข้าเรียน**; a CONFIRMED or PENDING row ⇒
**no Undo in the menu at all**. **(5)** the same control in the plan editor's row menu. **(6)** a role without the new
key ⇒ no Undo anywhere (and the owner must grant `calendar.undo` before Tanya can see it).

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27). **The owner's Undo feature exists.**
Verified: **620 pass / 0 fail** · tsc 0 · build ok · `UndoControl` on both surfaces (`BookingModal`, `PlanModal`).

🔑 **ONE control on both surfaces, one rule, one dialog** — and **TASK-514's ATTENDED branch removed in this task**, with the Sick-leave control returned to being a leave, **its original words byte-identical.** ⇒ **the two-buttons-for-one-act problem never existed for a day.** That was the whole reason I folded 517 in, and it is the part I was most worried about.
🔴 **`ยกเลิก` is pinned ABSENT from the entire family** — so Cancel and Undo cannot blur **by construction** rather than by everyone remembering the owner's ruling. **Better than the ruling asked for.**
🔴 **The body varies by state and the leave case says the coach IS told**, both directions pinned in both languages. **Without that catch we would have shipped the very defect this control exists to remove**, and she says so plainly.
🔑 **The refusals: the server's sentence verbatim, and NO refusal code in the component.** ⇒ `UNDO_SLOT_TAKEN` keeps the hour **and its holder**, and `UNDO_LEAVE_CHARGE_UNKNOWN` **reads as correct-by-design** — because the screen never re-words what the server decided. 📌 **That is the right architecture for refusals: a component that cannot paraphrase cannot get the reason wrong.** ✅ And the success toast is **reachable only after the await**, with the catch setting the sentence **and nothing else** — no optimistic update, on a control that moves money.

## 📌 Her mid-build correction is the most useful note in the report
She first asked the permission key **through a constant**, and **my own action sweep then listed `calendar.undo` among "keys with no FE site"** — **a perfectly wired door the sweep could not see.** She changed the site to ask its key as a **literal**, like every other site, with the reason in the code.
🔑 **"A pin that cannot see a door is worse than a verbose site, and the sweep was right to complain."** That is exactly right, and it is the inverse of the mistake we keep finding: **usually a derived check finds what a list missed; here a derived check would have reported a false absence, and the fix was to make the code legible to it rather than to loosen the check.**

## ❓ The calendar-link question: **NEITHER, and the answer is better than either**
**There is no calendar-link surface in the FE at all** — pinned as one of exactly two keys with **no FE site**, no fetch, no button, no `webcal` string. ⇒ **nobody can re-create the leak by hand through our UI, and there is nothing to fix.** ✅ **Question closed; no task.**
📌 **But her second sentence is the one going to Porter:** whoever uses that endpoint does so **outside the app** — so **if the customer is meant to be able to hand a coach a calendar link, that surface does not exist.** **A product gap, not a leak**, and worth the owner knowing rather than us noticing it again in six months.

## ▶️ One follow-up cut: TASK-526
Her check-in label leans on a **closed set of channel names** because `checkinSource` is open-ended (a staff check-in carries a username). **TASK-488's `checkinChannel` is exactly that closed set and it has already landed** — so the guess can go now rather than waiting.
