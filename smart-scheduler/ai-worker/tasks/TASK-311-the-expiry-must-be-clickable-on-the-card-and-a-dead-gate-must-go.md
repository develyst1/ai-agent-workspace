# TASK-311 — the expiry must be clickable ON THE CARD, and a dead gate must go

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-09)
🔴 **RELEASE ITEM — the owner wants `sid`, test and `uat` TODAY.** 🚫 No backend change. 🚫 No migration.
⚠️ **TWO INDEPENDENT sections. Either can land without the other** — they are together because both are small
and both are on the course screens. **If one turns out not to be small, do §1 and tell me.**

---

# §1 🔴 `REQ-085 §12.1` — the expiry control must be reachable from the CARD
> **the owner:** *"เขาสามารถเลือก expire date ให้ได้ แล้วแต่แอดมิน ขวาบน ควรแก้ได้"*

**The `expires …` date with the calendar icon, TOP-RIGHT of the course card, must be CLICKABLE. Click it, change
it.**
✅ **The capability already exists and is BUILT** — `EditExpiryDialog`, wired at `CoursePackagePanel.tsx:336`,
`REQ-082` AC-1 + AC-4. 🔑 **He is telling us WHERE it must be reachable FROM.** ⇒ **if it opens from somewhere
else today, THAT is the gap — not the feature.**
📌 **So the first thing to do is LOOK:** **how is that dialog opened today, and is the top-right `expires` line a
control or a label?** ⚠️ **If it is already clickable, say so and this section is closed** — 🔑 *two items in this
batch turned out to be already built, and both times the report was still real because it was about the SCREEN.*

**When you wire it:**
- 🚫 **Do NOT build a second dialog.** **One `EditExpiryDialog`, opened from one more place.**
- ⚠️ **`REQ-085 §11.3` binds it:** **an EARLIER date must SAY WHAT IT CUTS OFF before saving.** ✅ **The BE already
  serves that — `POST /courses/:id/expiry/preview` (TASK-298) returns the sessions it would cut AND the remaining
  leave room, writing nothing.** 🔑 **If the dialog does not already ask before saving, that is the same
  commit-then-show pattern we spent this week removing** — **and the route exists precisely so you do not have to
  compute anything.**
- 🚫 **Not a gate.** *"The admin may still do it; they may not do it BLIND."*

# §2 ⚪ A gate that can no longer fire — `Create plan`'s `exceedsCeiling`
**`CreatePlanFlow` disables `Create plan` on the preview's `exceedsCeiling`.** 🔴 **`REQ-085 §12` deleted the rule
behind it** — **TASK-309 made that field FALSE BY CONSTRUCTION, and it is asserted so on the backend.**
⇒ **the gate is dead code that can only ever mislead the next reader into thinking a ceiling still refuses.**
✅ **Remove the gate and the branch that renders its message.**
⚠️ **The FIELD stays on the DTO** — **@Jason deliberately did not change the contract, and the order is: the FE
gate goes FIRST, the field later, never both at once.** 🚫 **Do not touch `types/api/contract.ts`.**
📌 **The message it showed was the owner's own screenshot two days ago:** *"This course can only extend to week 5
— reduce the planned absences or pick a different start date."* 🔑 **He was told to change what he wanted because
a date could not move. That sentence should not exist any more.**

## §3 What must not change
- 🚫 The `ExpiryWarningAlert` component and what it renders — **it computes nothing and must keep computing
  nothing.**
- 🚫 `EditExpiryDialog`'s existing entry point *(add one; do not move one)* · the DTO's shape · any backend call.
- 🚫 TASK-295's `toTimeSlot` seam and the resume dialog · TASK-291's pause count.
- 🚫 No backend change · no migration.

## Definition of Done
- [ ] Typecheck clean; **state the command** · `bun test` / the FE suite green, **state the count**
- [ ] 🔑 **§1: the `expires` line on the card OPENS the expiry dialog** — asserted · **or: it already did, and you
      say so in one line**
- [ ] **§1: an EARLIER date says what it cuts off BEFORE saving** — ⚠️ **using `POST /courses/:id/expiry/preview`;
      🚫 compute nothing on the client**
- [ ] **§1: still not a gate** — the admin can save anyway, asserted
- [ ] **§2: `Create plan` is no longer disabled by `exceedsCeiling`**, and 🔑 **the "can only extend to week N"
      message is GONE** — asserted as an absence
- [ ] 🚫 **`contract.ts` untouched** — asserted
- [ ] 🔑 **Break it and watch** — restored, suite green before you report a number

## Question
⚠️ **§2 is the second dead FE gate this week** *(the first: the resume dialog's `disabled` that never fired
because the value was truthy).* 📌 **Both were guards whose CONDITION had quietly become impossible.**
🔑 **Is there anything cheap that would notice a `disabled` or a warning branch that can no longer be reached?**
**A test asserting a branch DOES fire is easy; one asserting it still CAN is not.**
⚠️ **If the honest answer is "no, it needs an eye", say so** — **we established this week that a fake mechanism is
worse than none.** 🚫 **Name it; build nothing.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-09. **Both halves, both small, both today.**

```
bunx tsc --noEmit → exit 0
bun test          →  183 pass
                       0 fail     (was 170 — +13, one new file)
bun run build     → ok
git status        →  9 modified · 1 new (expiry-preview.test.ts)   🚫 contract.ts not among them
```

### §1 — I LOOKED first, and it was not closed
**Today the `expires 12 Oct 26` line is a LABEL on the top-LEFT of the card**, and the only control is a
**14px subtle grey `CalendarClock` icon after it**. The top-RIGHT of the card is the status and lock badges. ⇒
**the capability existed and the screen did not say so** — the owner's *"ควรแก้ได้"* is exactly right about
what he saw.
✅ **The date is now the control.** `expires {date}` + the icon are ONE `UnstyledButton` (dotted underline,
`aria-label`/`title` = *"Change expiry date"*) opening the same `EditExpiryDialog` from the same spot. 🚫 Not a
second dialog; asserted mounted once. 🚫 Not moved: the icon stays, inside the button, so it is one control and
not two adjacent ones doing the same thing. `course.summary` was split into `sizeLine` + `expiresOn` (both
languages, same words) because a label cannot be half a button; the old key is gone.
⚠️ **One thing to check with him, because there are TWO top-right dates:** the plan modal's `SummaryBar`
also shows a date top-right — **`Ends {date}`, the LIVE END, derived** — and it is not the expiry and should
not become a control. If *"ขวาบน"* meant that screen, the answer is the card's control, not an edit on `Ends`.

### §1 / `§11.3` — it asks BEFORE saving now
`EditExpiryDialog` **was commit-then-show and its own header presented that as the design.** It was the
constraint: the warning only existed after `PATCH` had written. Now, **every time the admin lands on a date that
differs from the current one**, the dialog calls **`POST /courses/:id/expiry/preview`** and renders a
pre-save block: *what would fall after this date* (the list, capped at 5 like the post-save alert), and **the
leave room** written from the server's numbers — *"all N remaining leave days still fit"* or *"only R of N would
fit — a make-up for every one needs the expiry to reach D"*. **The SPENT case renders no leave line at all**
(TASK-298 §5, kept on this side).
🔑 **The answer is shown only if it is about the date on screen.** The response echoes the expiry it answered
(`contract.ts`: *"echoed, so a caller cannot report one and have decided another"*) — **that sentence is now
load-bearing code**: a slow answer for an earlier pick cannot land on a later one, and the guard is the
server's statement of what it answered, not this component's bookkeeping.
🚫 **Computes nothing** — no `dayjs`, no `.filter`, no date comparison in the block; `roomForAll` is the
server's verdict. Asserted.
🚫 **Still not a gate** — Save reads neither the preview nor the warning; asserted the same way it always was.
🚫 **`ExpiryWarningAlert` untouched and NOT reused for the preview** — it says *"the date has been saved"*,
which would be false before a save. The pre-save block is its own, and says *"nothing is saved yet"* in words.
The post-save path is byte-identical.
📌 The types live in `types/app/scheduler` beside `EndCoursePreview`, not in `contract.ts` — by instruction.
The mock previews too, with a tight-room case, so both sentences are exercisable offline.

### §2 — the gate is gone, and so is the sentence
`exceedsCeiling` is no longer read anywhere on the front end: `CreatePlanFlow`'s `ceiling` state, `PlanModal`'s
prop, its Alert, the `disabled` term **and the tooltip branch** are gone — `disabledHint` went with it because
the ceiling was its only source, and *a tooltip branch nothing can reach is the same dead gate one level down*.
`Create plan` is now disabled only while the preview is in flight. **`plan.ceilingRefusal` is deleted in both
languages** — *"reduce the planned absences or pick a different start date"* no longer exists. Asserted as
absences.
✅ **The field stays where it is typed** — `CoursePreview.exceedsCeiling?` in `types/app/scheduler:605` — and
**`contract.ts` was not touched for either half.** Asserted both ways.
⚠️ **Two things left deliberately, for the day the field goes:** the optional type above, and **the mock still
computes `exceedsCeiling` from a date comparison** (`scheduler.mock.service.ts:892`) — dead now, and a
client-side heuristic, but it mirrors a field that is still declared. Delete both together with the field.

### 🔑 Break it and watch — restored
Removed the echo guard (`setPreviewed(p)` unconditionally). The wiring assertion failed **naming the guard**;
the other 12 in the file stayed green. **Restored; `183 pass / 0 fail` after.**

### Definition of Done
- [x] `bunx tsc --noEmit` exit 0 · `bun test` **183 / 0** · build ok
- [x] 🔑 §1 the `expires` line OPENS the dialog — asserted (button targets `setExpiryTarget`, contains the words
      and the icon; one dialog mounted). **It did NOT already — it was a label with an icon beside it.**
- [x] §1 an EARLIER date says what it cuts off BEFORE saving — via `POST /courses/:id/expiry/preview`; nothing
      computed client-side, asserted
- [x] §1 still not a gate — asserted
- [x] §2 `Create plan` no longer disabled by `exceedsCeiling`; the *"can only extend to week N"* message GONE —
      asserted as absences in code and both dictionaries
- [x] 🚫 `contract.ts` untouched — asserted (and `git status` shows it unmodified)
- [x] 🔑 Break-and-watch — run, failed for its reason, restored, green before this number

## Question — **anything cheap that notices a `disabled` or a warning branch that can no longer be reached?**

**Honest answer first: no general mechanism, and the two this week were caught by different eyes.** A guard's
condition being reachable is a property of the DATA that arrives, and a unit test only sees the data it
brings. **But there are three cheap, specific things, and all three are already in reach:**

1. 🔑 **The BE test that pins a field constant IS the notice.** The day @Jason wrote *"false by construction"*
   and asserted it, every reader of that field on this side became dead — **and he knew it, which is why he did
   not touch the contract.** ⇒ **the cheap rule is procedural, not mechanical: a BE test that fixes a DTO field
   to a constant names its FE readers in the same notes** (one grep), and that grep becomes the FE task. This
   week it happened by good habit; it can be the standing habit.
2. 🔑 **Make the condition type-impossible where you can, and the class disappears.** TASK-295's first dead gate
   was `disabled={!startTime}` over a value that was truthy and unrenderable. `toTimeSlot(): TimeSlot` made that
   state unrepresentable — **the gate did not need fixing, because what it guarded against cannot exist.** That
   is the only mechanism that is both cheap and general, and it only works for gates over a closed set.
3. ⚠️ **A smell you can grep for, not a test:** a DTO field the FE reads **but no FE test ever sets to its
   active value.** `exceedsCeiling` was optional, read in two files, and **no assertion anywhere on this side
   had ever seen it `true`** — the mock could produce it, nobody ever asked. That is not proof of a dead gate,
   but it is where to point the eye first.

🚫 **What I would not build:** a test that a branch "still CAN fire" by feeding it the value it guards against.
It passes forever, because it brings its own data — **it is the fake mechanism we agreed is worse than none.**
📌 **Named, nothing built.**
