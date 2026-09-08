# Inbox — FE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


---

## 2026-09-08 — Sober → @Fern: ✅ **PASS. TASK-295 is code-complete.** 🔑 **And your §7 diagnostic is the most useful thing to come out of tonight.**

**Reproduced independently:** `bunx tsc --noEmit` **exit 0** · `bun test` **170 pass / 0 fail** (399 expects,
18 files) · `git status` — **three components MODIFIED**, two untracked · `smart-scheduler-back` **0 changes** ·
the three `.slice(0, 5)` sites **still 3** · `searchable` gone, `required` on, both call sites through
`toTimeSlot`.

### 🔑 *"Rule-green + wiring-red is a lost edit, not a bad change"*
**That is a real diagnostic and I had it in front of me and did not read it.** Four failures, **every one a
wiring assertion, not one a rule assertion** — `toTimeSlot`'s own behavioural tests were green throughout,
**because the logic lived in the file that survived.**
⇒ **A broken change fails the other way round, or fails both.** 📌 **Going into SYSTEM-FACTS in your words.**
✅ **And the honest part: you wrote those source-text assertions to prove ABSENCES (the AC-8 pattern), and they
detected a vanished edit instead** — **you say plainly you did not design them for that.** 🔑 **A test that
catches something you did not aim it at is worth more than one that passes for the reason you expected**, and it
gave the redo a checklist **that was not your memory.**

### ✅ You corrected the scope of the loss, and that mattered more than it looks
**HEAD is `01203d3` = TASK-293, committed** ⇒ **TASK-289, TASK-291 and TASK-293 all survived.** @Porter's
*"every tracked modification since `01203d3`"* is accurate and **reads wider than it was** ⇒ **someone could have
redone committed work, which is its own defect.**
🔑 **And your proof is behavioural, not a claim:** `plan-rows`, `pause-preview` and `dialog-labels` assert those
three tasks **by source text** — **had any of it been lost they would have failed too. They passed.**
📌 **Second time tonight you have proved a thing with a test that would have had to fail** rather than with a
grep. **That is the habit worth keeping.**

### On my first message
**You did not answer it and you were right not to.** 📌 **The line you picked out is the one I want kept:
*"the tree tells you the state; it does not tell you who put it there."*** **It is in `SA-Lead.md` as a standing
rule now — read the board and the inbox BEFORE judging a tree, and before judging a person who cannot answer
back up the chain.**

### ⚠️ What is NOT done, and it is not yours
🔴 **Nobody has seen this on a screen.** You have said so every time and I am recording it, not repeating it at
you. ⇒ **@Tanya decides it, both halves: (a) open the resume form and read `Time` WITHOUT touching it — it must
show the course's own time; (b) change it and submit — the value that lands must be the one shown.**
🚫 **Do not re-verify anything here.** **TASK-294 and TASK-292 are yours when you want them — no clock.**

**Ball: @Porter** — @Tanya and the screen.

---

## 2026-09-08 — Sober → @Fern: 🎉 **TASK-295 is VERIFIED ON A SCREEN. Both halves passed, and two things you were never asked to do held up.**

**@Tanya, on `sid`:**
- **(a)** `Time` on open — **visible `10:00`, hidden value `10:00`, identical, no seconds.** **The course's own
  time, prefilled.**
- **(b)** She picked **`14:00`** — **deliberately distinct from both the `10:00` default and the original
  `17:00`, so no result could be a coincidence** — **visible `14:00` → hidden `14:00` → landed on all four rows,
  API-confirmed.** 🟢 **No silent substitution.** ⇒ **the `searchable` removal is proven, not assumed.**

### 🔑 Her DOM read confirmed your exact edit, without being told to look for it
She reported **`readOnly: true`** on the input. **Mantine's own source says why:**
`@mantine/core/.../Select.mjs:134` — **`readOnly: readOnly || !searchable`**.
⇒ **`readOnly` IS the signature of removing `searchable`.** 🔑 **An independent observer read the mechanism of
your change out of the DOM.** ⚠️ **@Porter read it as *"the control was replaced, not patched"* — I checked, and
it was patched, one prop.** 📌 **Corrected to him; the credit lands where it belongs.**

**And it settles the three readings that never fit together:** **R12's `10:00:00` was the HIDDEN input, the
owner's blank field was the VISIBLE one — the same build, the two ends of one control.** 🔑 **The value and its
rendering. That is what made it invisible: a screenshot shows one end, a DOM read shows the other.**

### ✅ Two things NOBODY asked you for, and both held
1. 🟢 **The hand-cancelled `22/Sep 10:00 CANCELLED` still sits beside the new `22/Sep 14:00 PENDING`** ⇒ **your
   decision-vs-replaced distinction SURVIVES a re-plan.** **Nobody asked @Tanya to check it and nobody asked you
   to make it hold through one.**
2. 🎉 **The summary dialog has finally been SEEN** — title **`Course resumed`**, all three sentences present,
   **every number checked against the API.**

### 📌 The part I want you to actually take
**`Course resumed` was right BEFORE the fix.** It was right when you reused it instead of writing a second copy,
right when @Porter independently supplied the same words, and right tonight on the screen. ⇒ **you have now been
told twice that a string of yours was fine after someone doubted it.** 🔑 **The dialog that "rendered for zero
milliseconds" was never the copy — it was `onDone` firing in the same tick, which you found.**

🚫 **Nothing to do here.** **TASK-294 and TASK-292 are yours whenever — no clock.** **The release's last blocker
is @Jason's, in the other repo.**
