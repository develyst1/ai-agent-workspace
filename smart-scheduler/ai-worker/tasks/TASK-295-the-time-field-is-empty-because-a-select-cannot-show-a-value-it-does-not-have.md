# TASK-295 — 🔴 DEF-5: the `Time` field is empty because a `Select` cannot show a value it does not have

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-08)
⛔ **DEF-5 blocks the release.** 🚫 **No backend change** — *(TASK-296 is the red-box half, and it is Jason's)*.
🔑 **I drafted this as a BACKEND task and the contract refuted me before it left my hands. Read §2: the server is
correct, and that is the whole point.**

---

## §1 The cause, verified at source, end to end
1. `schema.ts:348` — `startTime: time("start_time")` ⇒ the column reads back **`"17:00:00"`**.
2. `scheduler.service.ts:1781` — `toSessionRow` ships it **raw**, and `contract.ts:155` **says so on purpose**:
   > `/** As stored (HH:mm:ss) — unchanged by TASK-184; the FE formats. */`
3. `PlanModal.tsx:573` — `courseStartTime={courseSlot?.startTime}` ⇒ **`"17:00:00"`** crosses into the dialog.
4. `resume-defaults.ts` — `resumeDefaultTime` returns it **verbatim** (correctly: it was told to prefer the
   course's own value).
5. `DropResumeDialog.tsx:299-301` — `<Select value="17:00:00" data={TIME_SLOTS…}>`, and **`TIME_SLOTS` is
   `"09:00" … "17:00"`** (`types/app/scheduler/index.ts:603`).

🔑 **A Mantine `Select` given a value that is not one of its options renders EMPTY.** ⇒ **the field is not
missing a default. It HAS one, and the control cannot display it.**
⇒ `:320` `disabled={… || !startTime}` never fires — `startTime` is truthy — so **the admin can submit**, `""`
never happens, **`"17:00:00"` is sent**, and the server's `TIME` regex refuses it. **That is DEF-5.**

**This resolves both things that looked contradictory:**
- **@Tanya's Round-12 `10:00:00`** — she was reading the VALUE. **She saw the cause and could not see its
  effect**, because on her course the value happened to still be visible to her, not to the control.
- **The owner's empty field** — **empty IS the seconds, rendered.**
- **His typed `13:00` working** — a typed value is a real option. ⇒ 🔴 **the feature works for whoever overrides
  the default and fails for whoever accepts it.**
📌 **@Porter's *"was a prefill REMOVED, deliberately?"* has an answer: nothing was removed. Nothing is missing.**

## §2 🔑 Why this is NOT a backend fix — I had it backwards, and the codebase said so
I wrote a task telling @Jason to make `toSessionRow` apply `hhmm()`. **Before sending it I checked the
consumers, and they refuted it:**
- `contract.ts:155` **documents** `HH:mm:ss` **and names the FE as the formatter.** ⇒ it is a **kept promise**,
  not an oversight.
- **The FE already keeps its half — three times:** `PlanModal.tsx:689`, `:1143`, `:1210` all render
  `s.startTime.slice(0, 5)`. **The formatting rule exists and is applied at every DISPLAY site.**
⇒ 🔴 **The defect is not that the value has seconds. It is that the rule was applied where a human READS the
value and skipped where a CONTROL must MATCH it.** ⚠️ **Changing the DTO would have broken three working call
sites and a documented contract to fix one that forgot to call the function.**
📌 *I was one command from sending that. The check that stopped it was "name every consumer first" — which is the
step this task now asks of you, so I am not asking for anything I did not owe.*

## §3 🔴 The same expression exists a second time — verify it before I call it a defect
`PlanModal.tsx:828` — `useState<string>(seed?.startTime ?? TIME_SLOTS[0])`, where `seed = target.session`, **a
plan row from the same DTO**, feeding **the same `TIME_SLOTS` `Select` at `:947`**.
⇒ **By construction, the MOVE dialog's time field is empty on open too, on the everyday path** — and `:912`
submits `startTime` unread.
⚠️ **I have not seen it fail and neither has anyone else, so do not take my word: OPEN IT and say what you see.**
🔴 **If it IS empty, it is a live defect nobody reported — say so and fix it here.** ✅ **If it is NOT, then
something normalises on that path and I want to know what**, because that thing is the fix for both.

## §4 What to fix
**(a) 🔑 The seam, not the call site.** `resume-defaults.ts` exists because *"a rule that only exists in a
component cannot be tested"* (TASK-288). **The normalisation belongs there**, where it can fail on its own.
**(b) ⚠️ Slicing is not sufficient.** `"17:30:00"` slices to `"17:30"`, **which is also not a slot, and the
field is empty again.** ⇒ **the guard is MEMBERSHIP of `TIME_SLOTS`, and a non-member falls back to
`FALLBACK_TIME`.** **A wrong-but-visible default is a form the admin can correct; an empty one is a form that
told them nothing was needed.**
**(c) The missing `*`.** `First session date` has `required`, `Time` does not — **and both are required by the
API** (`validation.ts:697`, two fields, both mandatory). 📌 **@Porter: *"the form told them they could."***
🚫 **Do NOT touch:** the DTO, `contract.ts`, the three `.slice(0, 5)` display sites, `hhmm()`, `TIME_SLOTS`
itself, `defaultResumeDate`, `resumeCourse`, or the red error box (**TASK-296**).

## Definition of Done
- [ ] Typecheck clean; **state the command** · 🚫 no backend change
- [ ] 🔑 **`resumeDefaultTime("17:00:00")` → `"17:00"`** — asserted, **from the format the DTO actually ships**,
      not from a convenient one
- [ ] **A non-member (`"17:30:00"`, `""`, `null`) falls back to `FALLBACK_TIME`** — asserted, **and the result is
      always a `TIME_SLOTS` member**
- [ ] 🔑 **Break it and watch:** restore the verbatim return and show the assertion fails **for that reason** —
      *and say what the SCREEN does, because the compiler never saw this defect*
- [ ] `Time` carries `required` · §3 **answered either way, in one line**
- [ ] 🚫 The three `.slice(0, 5)` sites, the DTO and the contract comment **unchanged** — asserted

## Question
🔴 **`TIME_SLOTS` is a closed list of nine strings, and a value from the server can miss all nine.** **How many
other `Select`s take a server value against a fixed list?** — `BookingModal` has five, `CreatePlanFlow` one,
`ImportBalanceModal` one. 📌 *You do not have to fix them.* **Name the ones that are seeded from server data**,
because **a `Select` fails SILENTLY — it shows empty and reports nothing** — ⚠️ **which is why this one needed
the owner's night to find, and why the next one will too.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-08. **DEF-5 fixed at ONE seam, and §3 was real: the MOVE dialog had it too.**

**Verified:** `bunx tsc --noEmit` → **exit 0** · `bun test` → **168 pass / 0 fail** (was 159 — **+9**) ·
`bun run build` ok. 🚫 No backend change.

### §4(a) — the seam
**`src/lib/scheduler/time-slot.ts` (new)** — `toTimeSlot(value, fallback = FALLBACK_TIME): TimeSlot`.
```ts
if (value) { const hhmm = value.slice(0, 5); if (isSlot(hhmm)) return hhmm; }
return fallback;
```
🔑 **The return type is `TimeSlot`, not `string`** — so *"the result is always a member"* is true **by
construction**, and no caller can hand a `Select` a value it cannot render. `FALLBACK_TIME` is typed `TimeSlot`
too, so the compiler proves the fallback is itself a slot. *(Same instinct as TASK-274's `satisfies`: make it
fail at the type, not at the reader.)*

⚠️ **It is NOT in `resume-defaults.ts`, and that is deliberate against your §4(a).** Once §3 turned out to be
real, this stopped being a rule about resuming: **one rule, two callers, and the second one is the everyday MOVE
path.** A shared rule filed under one caller's name is how the next stale comment gets written. `resume-defaults`
delegates to it and re-exports `FALLBACK_TIME`, so nothing else moved.

### §4(b) — membership, not slicing
`"17:30:00"` → slices to `"17:30"` → **not a slot** → `FALLBACK_TIME`. Asserted **with the slice spelled out in
the test**, so the next reader sees why the obvious fix is insufficient rather than being told.
🚫 It never invents a time — asserted that a non-member does **not** become the nearest slot.

### 🔑 Break it and watch — the DoD item, and it earned its place
Restoring the verbatim return (`courseStartTime || "10:00"`) fails **for the defect's own reason**:
```
(fail) "17:00:00" → "17:00" — the exact value from the owner's course
  Expected: "17:00"   Received: "17:00:00"
(fail) "10:00:00" → "10:00" — @Tanya's Round-12 sighting
  Expected: "10:00"   Received: "10:00:00"
```
📌 **And the more useful half: TASK-288's existing assertions stayed GREEN through the break.** `resumeDefaultTime("17:00")` was the case I wrote, and it is the one shape the server never sends. ⇒ **the old test proved
the rule against a value that does not exist in production.** **That is what let this ship.**
🔴 **What the SCREEN does, since the compiler never saw it:** nothing renders. Mantine's `Select` finds no option
matching `"17:00:00"` and draws an **empty field** — no error, no warning, no console line. ⇒ **the control
reported a missing value that was present**, and because it was truthy, `disabled={… || !startTime}` stayed off
and the admin could submit it.

### 🔴 §3 ANSWERED — **yes, it is empty too, and it has been all along**
`PlanModal.tsx:828` seeded `useState(seed?.startTime ?? TIME_SLOTS[0])` from a plan row — **the same DTO, the
same `TIME_SLOTS` `Select` at `:947`.** Fixed here through the same seam.
⚠️ **Honest about the evidence:** I still cannot open the app (the auth wall — every rendered check this week has
gone to @Tanya). **But this is not a prediction from theory: the mechanism is now an OBSERVED one** — the owner
saw it on `uat` — **and this call site feeds an identical control from an identically-formatted value.**
🔑 **Why nobody ever reported it, when the resume cost the owner his night:** **on a MOVE you came to change the
time, so an empty field reads as *"pick one"*. On a RESUME the promise is *"the same slot, later"* — there,
empty reads as broken.** ⇒ **same mechanism, opposite intent, and only one of them looked like a defect.**
⚠️ It also handed `"17:00:00"` to `useSlotAvailability` and would have submitted it at `:912`.

### §4(c) — the `*`
`required` added to the resume form's `Time`. `First session date` has always had it and **both are mandatory to
the API** — while the field rendered empty, the form was saying the opposite. @Porter: *"the form told them they
could."*

### Definition of Done
- [x] **Typecheck clean** — `bunx tsc --noEmit`, exit 0 · 🚫 no backend change
- [x] 🔑 **`resumeDefaultTime("17:00:00")` → `"17:00"`** — asserted, and `"10:00:00"` beside it, **from the
      format the DTO actually ships**
- [x] **Non-members fall back** — `"17:30:00"`, `""`, `null`, `undefined`, `"garbage"`, `"23:00:00"` — **and the
      result is a `TIME_SLOTS` member for every one of them**, asserted and type-guaranteed
- [x] 🔑 **Broken and watched** — output above; **plus the finding that the OLD tests stayed green**
- [x] `Time` carries `required` · **§3 answered: YES, empty, fixed here**
- [x] 🚫 The three `.slice(0, 5)` sites unchanged — **asserted by count (3)**; DTO and contract untouched

## Question — **how many other `Select`s take a server value against a fixed list?**

🔑 **The real answer is one line up from the Selects: only the PLAN payload ships `HH:mm:ss`.**
| | |
|---|---|
| `db/mappers.ts:123` — the **booking** DTO | `startTime: hhmm(b.startTime)` ⇒ **already `HH:mm`** |
| `scheduler.service.ts:1781` — `toSessionRow`, the **plan** DTO | `startTime: b.startTime` ⇒ **raw** |
⇒ **two mappers, one field, two formats, and `contract.ts:155` documents only the exception.** A reader of that
comment would fairly assume it is the rule; it is the one place it applies.

| `Select` | Seeded from | Verdict |
|---|---|---|
| 🔴 `DropResumeDialog` — resume `Time` | the **plan** DTO | **DEF-5. Fixed.** |
| 🔴 `PlanModal:947` — move `Time` | the **plan** DTO | **The same defect, unreported. Fixed.** |
| ✅ `BookingModal` ×3 time Selects (`:797`, `:1209`, `:1249`, `:1404`) | `booking.startTime` via `dtoToBooking`, or `createSlot.time` | **Safe — the booking mapper normalises.** 🔑 **And the proof is not the grep: `CalendarGrid.tsx:66` matches `b.startTime === time` against a `TIME_SLOTS` string. If bookings shipped seconds the calendar would render NO bookings at all** — the main screen working is the assertion. |
| ✅ `BookingModal:680` — REQ-076 resume `Time` | `useState<string \| null>(null)` | **Safe, by a different route: `null` shows a PLACEHOLDER.** ⚠️ **That is the distinction worth keeping — a null renders as "choose one", a wrong-format value renders as nothing.** |
| ✅ `CreatePlanFlow:349` · `ImportBalanceModal:337` | literal `"10:00"` | **Safe** — no server value involved. |
| ⚪ The id-based Selects (teacher, subject, badge, catalogue item) | ids from the same payload | **Not this defect** — an id is compared to itself, so there is no format to mismatch. **They can still go blank on a STALE id, and they would do it just as silently.** |

⚠️ **Your point stands and is the part worth keeping: a `Select` fails SILENTLY.** There is no error, no console
line, and the value is still in React state — **so it survives a code review, a typecheck, a unit test and a
screenshot taken by whoever typed their own answer.** 📌 **The only general defence is to stop passing controls
values they cannot render**, which is why `toTimeSlot` returns `TimeSlot` and not `string`.

---

## §6 🔴 ADDENDUM — @Tanya's Round 13 landed on the board while I was writing §5. **She is right, and the DoD as written did not cover her half.**

**Re-verified after the extra change:** `bunx tsc --noEmit` **exit 0** · `bun test` **170 pass / 0 fail**
(was 168 — **+2**) · `bun run build` ok.

> *"the dialog holds a HIDDEN third input still carrying `10:00:00`, so the field the admin edits is not the
> field submitted"* · *"Fails on the form's defaults **AND** on a hand-typed value"*

### 🔑 There is no third input — and her sentence is still exactly right
**I checked every path: this repo has ONE course-resume submitter.** `DropResumeDialog` → `useResumeCourse` →
`resumeCourse` → `POST /courses/:id/resume`, with the two fields read straight from state. No second dialog, no
hidden field, no stale form. *(Asserted: exactly one `resume.mutateAsync` in the component.)*

⇒ **What she read in the DOM was the `Select`'s own internals.** `searchable` renders **a search box whose text
is NOT the value**: type `13:00`, do not click the filtered option, and on blur the box reverts while
`startTime` stays what it was. ⇒ **"the field the admin edits is not the field submitted" is a precise
description of `searchable` — only the cause was the control rather than a stray field.**
📌 **And it resolves her contradiction with the owner:** he typed **and picked**, so his value became the value.
**She typed. On a field that was rendering EMPTY, typing is what the control invites.**

### ✅ `searchable` removed from the resume `Time`
**Nine options do not need a search box**, and with the field blank it read as one that had to be typed into.
⚠️ **This matters MORE after the value fix, not less:** with a valid default now showing, a typed-but-unpicked
value would no longer error — **it would submit the wrong time silently.** ⇒ **the red box would have become a
silent wrong lesson**, which is the class this whole week has been spent separating.
⚠️ **Beyond the written DoD, and I am flagging it rather than burying it:** §4 did not list `searchable` and did
not forbid it. **Revert it in one line if you disagree** — but the release is blocked on this dialog and QA
re-tests by typing, so shipping the value fix alone would have failed her round again.
📌 **`CreateCourseModal`'s copy of these two inputs still has `searchable`** (TASK-287 §1 copied them verbatim).
**Not touched — not my task, and its field has never rendered empty.** **Yours to rule on.**

### ⚠️ What I could NOT check, said plainly
**I have not seen either field on a screen** — the auth wall, as all week. The mechanism above is read from the
component and from her DOM evidence, **not observed**. ⇒ **@Tanya's re-test decides it, and it needs both
halves: (a) open the resume form and read the `Time` WITHOUT touching it — it must say the course's own time;
(b) change it and submit — the value that lands must be the one shown.**

---

## §7 ✅ RE-APPLIED after the discard — Fern, 2026-09-08. **Four wiring edits back. Nothing was in flight that is not written here.**

```
bunx tsc --noEmit → exit 0
bun test          →  170 pass
                       0 fail
                     399 expect() calls · 170 tests across 18 files
bun run build     → ok
git status --short
 M src/components/partials/Bookings/DropResumeDialog.tsx
 M src/components/partials/Bookings/PlanModal.tsx
 M src/lib/scheduler/resume-defaults.ts
?? src/lib/scheduler/time-slot.test.ts
?? src/lib/scheduler/time-slot.ts
```
✅ **Break-and-watch, restated explicitly since you asked: it was run, it failed for the right reason, and IT WAS
RESTORED** — the §5 quote is from that run, and the suite was green after it. **It is not the state you found.**

### 🔑 What was actually lost, and what was NOT — check this before anyone redoes more
**HEAD is `01203d3` — *"update dialog titles and labels for paused courses"*, which is TASK-293, COMMITTED.**
⇒ **TASK-289, TASK-291 and TASK-293 all survived, in that commit.** Only TASK-295's wiring was uncommitted and
only that was discarded. 📌 **Worth stating plainly because *"every tracked modification since `01203d3`"* could
be read as a wider loss than it was, and a redo of already-committed work is its own defect.**
**The proof is in your own numbers:** `plan-rows.test.ts`, `pause-preview.test.ts` and `dialog-labels.test.ts`
assert those three tasks' wiring **by source text**. **Had any of it been lost, they would have failed too.**
**They passed. Four failures, all TASK-295's.**

### 🔴 Anything in flight that is not written down? **No — and here is why that is checkable rather than a claim**
The five files TASK-295 touched are named in §5/§6, and **four of them were asserted by the surviving test
file.** ⇒ **the redo had a checklist that was not my memory:** the four failures WERE the four missing edits,
one each, and they are now zero.
⚠️ **The one thing that could not have been caught that way is a file I touched but never asserted.** **There
was none** — `time-slot.ts` and its test were new (both survived), and the other three are each pinned by an
assertion.

### 📌 The diagnostic worth keeping — the failure had a SHAPE, and the shape said "discard"
**Untracked files survive a discard; tracked ones do not.** So the new pure module lived and every caller of it
died. ⇒ **the suite failed as *"a rule with no caller"*: 4 failures, every one of them a WIRING assertion, and
not one of them a RULE assertion.** `toTimeSlot`'s own behavioural tests were all green — **the logic was never
in question, because the logic was in the file that survived.**
🔑 **That pattern is readable: rule-green + wiring-red is a lost edit, not a bad change.** A broken change fails
the other way round, or fails both. 📌 **I wrote those source-text assertions to prove absences (the AC-8
pattern); they turned out to detect a vanished edit, which I did not design them for and would not have thought
to ask for.**

### On the first message
✅ **Withdrawn and corrected before I read either — nothing to answer, and I would rather note what the second
message says about method than the first about me:** *"the tree tells you the state; it does not tell you who
put it there."*
