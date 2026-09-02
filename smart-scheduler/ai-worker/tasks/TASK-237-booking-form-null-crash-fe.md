# TASK-237: FE — DEF-1 + DEF-5: the booking form dies on a null read while editing

- Source: REQ-078 **DEF-1** (blocker) **+ DEF-5** (Tanya, `tests/TEST-064`)
- Status: ✅ DONE — code (Sober 2026-09-01) · rendered repro = @Tanya. Was: **REVIEW** (Fern 2026-09-01) — cause found and fixed; regression **proven to fail without the fix**
  (it reproduces the exact `TypeError`). ⚠️ The lead in this task was **not** the cause — see the notes.
  _Was: TODO — 🔴 blocker on REQ-078's release._
- Depends on: none. Repo: **smart-scheduler-front**, on `develop`. Assignee: **@Fern**

## The defect

**Repro (Tanya, 3 of 3):** อื่นๆ form → remove the **last** teacher chip → type **one character** in ชื่อรายการ →
the page dies. **All input is lost.** Uncaught `TypeError: Cannot read properties of null (reading 'value')`.

🔴 **This is AC-19's own path.** Correcting a wrongly-picked teacher is something an admin does all day, and
losing a half-filled form to it is worse than the feature being missing.

**DEF-5 — two more page deaths during ordinary editing — is very likely the same null read.** Tanya could not
reduce them to a repro **and said so rather than inventing one**. ⇒ **Fix the cause, then re-walk her DEF-5
paths before closing.** If they survive the fix, they are a separate defect and must be reported as one, not
quietly absorbed.

## A lead, not a conclusion — the only `.value` read on a possibly-absent object in this path

`components/common/TeacherOption.tsx:32`:

```tsx
const t = teachers.find((x) => x.id === option.value);   // ← `.value`, on `option`
```

It is passed to Mantine as `renderOption={({ option }) => <TeacherOption option={option} teachers={teachers} />}`
on the อื่นๆ teacher `MultiSelect` (`BookingModal.tsx:1076`). **The property name matches the error exactly**, it
sits on the control the repro empties, and typing in the Title box is what forces the re-render.

⚠️ **Verify it before fixing it.** Reproduce first (the mock covers this form — TASK-226's route), read the
actual stack, and confirm the frame. **If the stack points somewhere else, follow the stack, not this task** —
a plausible cause that is not the cause is how the real one survives the fix.
📌 `TeacherOption` is also used by the **bookings-table teacher filter** (`BookingsTable.tsx:221`). If it is the
cause, that is a second live site and it explains DEF-5's "ordinary editing" reports.

## What to do
- Fix the cause so the component cannot be handed an absent option — guard the read, and **say on the line why
  the guard is there** so nobody removes it as defensive noise.
- 🔴 **Add a regression that fails on the current code.** The repro is three keystrokes; a test that only passes
  after the fix is what stops it coming back. If it truly cannot be unit-tested, say so explicitly and pin the
  pure part instead.
- ⚠️ **Do not "fix" it by making the form keep at least one teacher.** AC-19 requires the empty state to be
  reachable and refused with a message — removing the last chip is legal, saving without one is not.

## Definition of Done — the OUTCOME
- [ ] The exact repro (remove last chip → type in Title) **does not crash**, and the form keeps every value
      already entered.
- [ ] Saving with **zero** teachers is still refused with the AC-19 message — the guard did not become a block.
- [ ] Tanya's two DEF-5 paths re-walked; state in your notes whether they are fixed by this or still open.
- [ ] A regression exists that **fails without the fix**.
- [ ] The four existing booking types' create forms are unchanged.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun run build` ok · suite green (report the count).

## Implementation Notes (Fern, 2026-09-01)

**Repo:** `smart-scheduler-front`, `H:\scheduler\smart-scheduler-front`. `git rev-parse HEAD` = **`bda6511`**.

### 🔴 The cause — and it is NOT the lead in this task. It is mine, from TASK-226.

**`BookingModal.tsx:1088` (as it stood):**

```tsx
onChange={(e) => setOther((p) => ({ ...p, title: e.currentTarget.value }))}
```

React nulls `event.currentTarget` **the instant the listener returns** (`executeDispatch` does it after every
listener). A `setState` **updater** is a closure React calls **later**, during the render it schedules. So that
read happens after the event is dead — on `null`. `.value`, on `null`. **Exactly the reported error.**

Two sibling handlers had the identical shape with `.checked`: the **Charge** switch (`:1108`) and the
**Consume** switch (`:1177`). All three were mine, from TASK-226. All three are fixed.

### Why it is INTERMITTENT — the part that matters, because "it usually works" is why this shipped

`dispatchSetState` has an eager-evaluation fast path: when the hook has **no pending update**, React runs the
updater **synchronously inside the handler** to see whether it can bail out of re-rendering — and there
`currentTarget` is still alive, so the buggy code works. Queue an update on that same hook first and the fast
path is gone; the updater is deferred to the render phase, where the event is null.

**That is precisely Tanya's repro.** Removing the last teacher chip fires `setOther` through the MultiSelect,
which leaves an update pending on the hook — so the very next keystroke in Title takes the deferred path and
dies. 3 of 3, as she found.

### DEF-5 — her two unreducible deaths fit this exactly, and her own detail is what confirms it

She reported them *"once right after toggling `Charge for this booking`, once when typing in Title with the
charge block open"*, both with the **same** `reading 'value'` message.

📌 **The first one is the tell, and it is worth reading twice.** Toggling Charge does not itself crash — it
*queues* an update on the `other` hook. The crash lands on the **next** read, which is the Title field: hence
`reading 'value'` and not `reading 'checked'`, from a path that "started" at a switch. Both of her contexts are
the three handlers above, and the eager-path explanation is also **why she could not reproduce them on retry** —
whether React's fast path is available depends on what else happened to be queued, which is not something a
tester can hold constant.

⇒ **I expect DEF-5 to be closed by this fix.** ⚠️ **I have not confirmed it** — see "Not done" below. If either
path survives, it is a separate defect and must be reported as one, per this task.

### 🔴 Why the task's lead is ruled out — checked, not dismissed

`TeacherOption.tsx:32` reads `option.value`, and the property name does match. But:

- `teachers.find(...)` returning `undefined` is **already guarded** (`t ? t.nickname : option.label`). For it
  to throw, Mantine would have to pass `option === null`, which its own `ComboboxItem` type forbids.
- **Decisive, and it needs no browser:** `TeacherOption` has **8 call sites** — the calendar header, the
  reports filter, the bookings-table filter, the course/plan/import modals, and the lesson-type teacher picker.
  **Seven of them have been in production for weeks.** If it were the cause, this crash would not be new to the
  อื่นๆ form.

Following the lead would have produced a defensive guard in a component that was never broken, left the real
cause in place, and — because the fix "looked" applied — made the next report much harder to believe.

### The fix

The three handlers are now **named functions** in `lib/scheduler/other-booking.ts`
(`onOtherTitleChange` / `onOtherChargeToggle` / `onOtherConsumeToggle`), each reading the event **eagerly** in
the handler body and passing a plain value into the updater. They live there, not inline, for the reason
TASK-147 established: **a rule that only exists in JSX cannot be tested.** The comment block above them states
the rule, the React mechanism, and why it is intermittent — so nobody removes it as defensive noise.

🚫 **`e.currentTarget?.value` was rejected as the fix.** It stops the crash and silently writes `""` — a title
that vanishes as you type is worse than a stack trace, because nobody reports it as a bug. That is asserted in
the tests, not just argued here.
🚫 **AC-19 was not touched.** The form still lets staff empty the teacher list; what is refused is *saving*
without one. Asserted directly (`teacherIds` stays `[]` and `errOtherNoTeacher` is still raised).

### 🔴 The regression — and it FAILS without the fix. I checked, rather than claiming it.

`other-booking.test.ts`, new block (6 cases). It simulates React's actual lifecycle, which is the only thing
that reproduces this: call the handler → **null `currentTarget`** → *then* run the captured updater.

I temporarily restored the buggy one-liner and ran it. Output:

```
TypeError: null is not an object (evaluating 'e.currentTarget.value')
(fail) 🔴 DEF-1 … > keeps the typed character — the exact repro, and it must not throw
(fail) 🔴 DEF-1 … > keeps the WHOLE title, not an empty string
(fail) 🔴 DEF-1 … > touches nothing else on the draft — the rest of a half-filled form survives
(fail) 🔴 DEF-1 … > AC-19 still holds …
 20 pass, 4 fail
```

That is **the same error Tanya saw**, in Bun/JSC's wording of it (Chrome: *"Cannot read properties of null
(reading 'value')"*). Then restored the fix → 82/0.

Also asserted: the crash's real cost — that **the rest of a half-filled form survives** the keystroke
(`expect(next).toEqual({ ...filled, title: "ก" })`), since losing everything typed was the reported harm.

### 🧹 Repo-wide sweep — no second instance

`grep -rnE "\(\(\w+\) => \(\{[^}]*(currentTarget|\.target)" src/` → **the only hit is my own comment quoting the
defect.** Every other `currentTarget` read in this repo (20+ sites) already reads eagerly and hands the value
straight to `setX(value)`. These three were the only lazy ones in the codebase.

### Verified

- `bunx tsc --noEmit` → **exit 0**.
- `bun test` → **82 pass / 0 fail**, 166 expect() calls, 10 files (was 76/0; **+6**).
- `bun run build` → ok, all routes emitted.
- The four existing booking types' create forms: **untouched** — the fix is inside the `isOther` branch's
  handlers only; the lesson branch has no `setOther` and was not edited.

### 🔴 Not done, and why

**I could not run the repro in a browser.** `/scheduler/*` is behind the auth proxy and the only way through is
a password field I may not fill (same wall as TASK-222/226/227). So:

- **The DoD's "the exact repro does not crash"** is proven at the level of the mechanism — the regression
  reproduces the exact TypeError and then passes — but **not by clicking through the form.**
- **Tanya's two DEF-5 paths are NOT re-walked by me.** They are hers, on `sid`, and she could not reduce them
  to a repro; my account above says why I expect them fixed, but expecting is not verifying.

**@Sober — please route both to @Tanya via @Porter.** This is a **LOCAL** check (mock covers the whole form —
TASK-226's route), not a `sid` one:

1. The exact DEF-1 repro: remove the last teacher chip → type in Title. No crash, **and every field already
   filled is still there.**
2. Save with zero teachers → still refused with *"กรุณาเลือกครูอย่างน้อย 1 คน"*.
3. Her two DEF-5 contexts: toggle Charge then type in Title; type in Title with the charge block open. If
   either still dies, it is a **separate** defect — report it as one, do not fold it into this.

## Questions

**Q1 — a process point, not a technical one, and it is against my own work.**
The lead in this task was specific, plausible, and wrong, and the task itself told me to verify it first. That
instruction is the only reason the real cause was found: `option.value` and `e.currentTarget.value` both "match
the error", and the wrong one had a named file and line number attached. **Would you consider making "name the
lead, and say explicitly it may be wrong" the standing shape for defect tasks?** You already wrote it here
(*"if the stack points somewhere else, follow the stack, not this task"*) — I am asking whether it should be the
default rather than this task's good instinct, because a lead in a task file reads with the authority of the
task, and a plausible-but-wrong cause is how the real one survives a fix.

**Q2 — mine to own, and I would rather it be recorded than quietly fixed.**
This defect was **introduced by TASK-226 and passed your review, my own tests, tsc, and the build.** It could
not have been caught by any of them: the shape is legal TypeScript, the types are correct, and it works most of
the time. What caught it was **Tanya running the form** — and the reason a fix was possible at all is that she
gave the exact console error and a 3-of-3 sequence. It is worth noting somewhere that the rendered checks I keep
routing to her are not a formality at the end of my tasks; on this one they were the *only* detector.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-01: ✅ **PASS.** You disproved my lead properly and found a cause I had already passed.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **82 pass / 0 fail** (+6) · `build` ok · the three handlers
named in `lib/scheduler/other-booking.ts:111,117,122` and wired at `BookingModal.tsx:1091,1111`.

### 🔴 The lead was wrong and your disproof is better than the lead was

I gave you `TeacherOption.tsx:32` because the property name matched. **Your refutation needed no browser and is
decisive:** the component has **8 call sites, 7 of them in production for weeks** — if it were the cause, this
crash would not be new to the อื่นๆ form. The `t ? … : option.label` guard already covers the `undefined` case,
and `option === null` is forbidden by its own type.

📌 **And you named the cost of having followed it: a defensive guard in a component that was never broken, the
real cause still in place, and — because the fix "looked" applied — the next report much harder to believe.**
That is exactly why I wrote *"follow the stack, not this task"*, and you did.

### The cause, and the part that makes it a proper diagnosis

React nulls `event.currentTarget` when the listener returns; a `setState` **updater** is a closure React calls
during the render it schedules — **after** the event is dead. Three handlers read it there.

🔴 **The intermittency explanation is the load-bearing half, and it is what turns DEF-5 from "unreducible" into
"explained".** `dispatchSetState`'s eager path runs the updater synchronously **when the hook has no pending
update** — so the buggy code works until something queues one first. Removing a teacher chip queues exactly that,
so the next keystroke takes the deferred path and dies: **Tanya's repro, 3 of 3, derived rather than matched.**

And the tell you drew out of her report is the good one: toggling Charge *queues*, the crash lands on the **next**
read (Title) — which is why the message says `reading 'value'` from a path that "started" at a switch. **Her two
unreducible deaths are the same defect, and why she could not reproduce them on retry is now explained by the
mechanism instead of excused.** ⚠️ Your caveat stands: if either path survives, it is a separate defect and gets
reported as one — not absorbed.

### The judgement calls, all three right

- 🚫 **Rejecting `e.currentTarget?.value`** — it stops the crash and silently writes `""`. **A title that vanishes
  as you type is worse than a stack trace, because nobody reports it as a bug.** Asserting that in the tests
  rather than arguing it in prose is the right way to make it stick.
- 🚫 **Not touching AC-19** — emptying the list stays legal, *saving* empty stays refused. The obvious wrong fix
  here was to forbid the state that triggers the crash.
- **Lifting them out of JSX** — same reason as TASK-147, and it is what made the regression possible at all.

### 🔴 The regression is the standard I want to hold everything to

You **restored the buggy one-liner, ran it, and pasted the four failures** — including that the error text matches
Tanya's in JSC's wording. That is the difference between *"a test exists"* and *"a test that fails without the
fix"*, and almost nobody does the first half. Keep doing it.

**The repo-wide sweep** (`grep` for the lazy-read shape; the only hit is your own comment quoting the defect) is
what makes "no second instance" a fact rather than a hope.

### 📌 My miss, on the record

**These three handlers were in the TASK-226 diff and I passed it.** I reviewed that task closely enough to praise
the `SegmentedControl` and to catch three arrays, and I read straight past
`onChange={(e) => setOther((p) => ({ ...p, title: e.currentTarget.value }))}` — because it looks like every other
handler in the file. **You wrote it and I approved it; the defect is as much mine as yours**, and the reason it
survived review is that the wrong version is visually indistinguishable from the right one. That is precisely the
kind of thing that needs a lint rule or a named helper rather than two people reading harder — and you have now
supplied the helper.

**Status → DONE (code).** The rendered repro is @Tanya's last round.
