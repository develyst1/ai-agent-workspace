# TASK-532 — a DOM harness, so "a control is proven by clicking it" is enforceable — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-27) · **Size S.** Your proposal at the end of TASK-531. **My decision, and I am taking it: this is test infrastructure in our own repo, not a product change.**

## §0 Why
TASK-531 set the rule **a control is proven by clicking it** — and then could not fully meet it, **because this repo has no DOM in its test setup** (no jsdom, no happy-dom, no testing-library; `playwright` is an unused devDependency — **I checked**). ⇒ **the handler's whole effect is proven, and the `onClick` wiring and the paint are not.**
🔑 **A standard that cannot be enforced becomes a thing people remember to do.** We have spent the week replacing exactly that with checks — **this is the same move for the rule I have just written.**
📌 **And it is not hypothetical: the Undo control shipped twice and was unusable both times.** The second time, **the only thing standing between "it renders" and "it works" was Tanya.**

## §1 Build
- **Pick ONE harness and say why**, weighing: **how close it is to a real browser · how much it slows the suite · how much configuration it adds · whether it works with Bun's runner as we use it.** 🔑 **I care more about the reasoning than the choice** — and ⚠️ **if the honest answer is "the credible option is heavier than the problem", say so and stop.** That is a real possible outcome and I would rather have it than a harness nobody runs.
- **Prove it on the control that caused this:** the Undo item — **a real click on the menu item ⇒ the dialog appears ⇒ confirm ⇒ the request goes**, for at least one state.
- 🔑 **Then close TASK-531's stated gap explicitly:** the `onClick` wiring and the dialog's paint, **which she named as unproven.** **Say in the report that the gap is closed, or which part of it is not.**
- 🚫 **Do not convert the existing suite.** One harness, one proof, and a note on when to reach for it. **A migration of 631 tests is a different task with a different justification**, and most of them are right as they are.
- ⚠️ **Report the cost honestly: the suite's run time before and after.** 📌 If it doubles, **I want to know before it is normal** — a slow suite stops being run twice, and running it twice is how I verify.

## §2 What this does NOT license
🚫 **A browser test for every component.** The rule is *"a control is proven by clicking it"* — **a control**: something a person presses that then does something irreversible or expensive. **Not every label, not every layout.** 📌 **If this harness starts being used to assert that text is centred, it will be slow, brittle and deleted within a month** — and the rule will go with it.

## Definition of Done
- [ ] One harness chosen **with the reasoning stated**, or **"not worth it" argued and nothing installed** · a real click ⇒ dialog ⇒ confirm ⇒ request, on the Undo control, at least one state · TASK-531's named gap **closed or precisely narrowed** · the existing suite **not converted** · **run time before and after, stated** · a short note on when to reach for it · suite **count** · tsc · build ok · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-27. **The rule is enforceable now: the Undo is clicked, the dialog paints, the request goes.**

```
bunx tsc --noEmit → exit 0
bun test          →  635 pass / 0 fail   (was 631; +4 clicked)
bun run build     → ok
⏱️ run time       →  BEFORE 1.6s · AFTER 2.8s  (+1.2s, ×1.75 — 4 DOM tests in one file; the 631 fast tests are ~1.6s of it)
git status        →  4 devDeps · bunfig.toml · test/dom-preload.ts · 1 new .dom.test.tsx · tsconfig exclude
```
🚫 No BE change. 🚫 No deploy asked.

### The choice, and the reasoning you asked for
**`happy-dom` + `@testing-library/react` + `@testing-library/user-event`** (with `@happy-dom/global-registrator` — in v20
the registrator is its own package), loaded once by `bunfig.toml` → `test/dom-preload.ts`.
| weighed | happy-dom + testing-library | Playwright (already a devDep) | jsdom |
|---|---|---|---|
| close to a browser | a DOM, no CSS engine or layout — enough to click, paint and query | **the real thing** | a DOM, slower than happy-dom |
| suite cost | **+1.2s total** for this file | seconds per test, plus browser start | ~2–3× happy-dom's |
| configuration | `bunfig.toml` + ~40 lines of stubs (`matchMedia`, `ResizeObserver`, `document.fonts`) | a downloaded browser, a dev server, a second command, CI wiring | similar to happy-dom |
| works with Bun as we use it | **yes — same `bun test`, one preload** | a separate runner beside `bun test` | yes |
🚫 **Playwright rejected for THIS job, not in general:** it is the right tool for a journey through the real product (and
if we ever want the shop-front QR walked end to end, that is its task). It is the wrong tool for *"does this button do
anything"*, because the answer needs to come back in the same second as the other 631 tests or nobody will wait for it.
⚠️ **"Heavier than the problem" was a live option and I did check it before installing:** the whole harness is one preload
and one dependency group, the proof is four tests in one file, and it caught a real process-wide bug the same afternoon
(below). That is why I did not stop.

### 🔑 TASK-531's gap — **closed, and here is exactly which part**
She named two things unproven: **the `onClick` wiring** and **the dialog's paint**. `undo-control.dom.test.tsx` mounts the
real hook inside a real Mantine `Menu` (item in the dropdown, dialog outside — the shape both hosts use) and:
1. asserts the dialog is **not** on screen — the state D4 never got past;
2. **clicks the menu item with `userEvent`** (a real pointer sequence, not a handler call);
3. **finds the dialog by its heading** — that is the paint, proven, on the very click that closes the menu;
4. **clicks confirm** and asserts `POST /bookings/bk-qr/undo` at the API boundary, with nothing asked before it;
5. repeats for a **LEAVE** row: its own label and body (*the coach IS told*), a reason **typed** into the textarea, and
   `{ reason: "keyed by mistake" }` in the body;
6. a **refused** act: the server's sentence appears on screen, **the dialog stays open**, one attempt, no success;
7. a **CONFIRMED** row: no control to click at all.
⇒ **Both named parts are now proven for the Undo.** What remains outside this harness is the real browser's own behaviour
(CSS, focus rings, z-index, a phone's tap) — **no DOM harness proves those**, and I would rather say so than let "clicked"
sound like "seen".

### 📌 A real hazard the harness found in its own first hour
`mock.module` is global to the test **process**. My first version returned only the members this file needed from
`@/hooks/scheduler`, which **silently deleted the rest for every other file in the run** — two unrelated suites failed
with *"Export named 'useResolveClashMove' not found"*. Every mock now **spreads the real module** and replaces one member,
and the reason is written in the file. 📌 Worth knowing beyond this task: **a module mock in Bun is not scoped to the file
that writes it**, so anything less than a spread is a booby trap for whoever adds the next test.

### 🚫 What I did NOT do
- **The existing 631 are untouched** — no conversion, no rewrite. Most of them are pure rules and source pins, and they are
  right as they are.
- The note at the top of `test/dom-preload.ts` states the boundary in the file people will copy from: **a `.dom.test.tsx`
  is for a CONTROL — something a person presses that is irreversible or expensive** (it moves money, it messages a family).
  **Not labels, not layout, not copy counts.** It says plainly that a harness used to assert text is centred will be slow,
  brittle and deleted within a month, and the rule with it.

### When to reach for it (the short note)
Reach for a `.dom.test.tsx` when **a person presses something and the consequence is expensive**: an undo, a cancel, a
money post, a message to a family, a batch check-in. Prove the *path* — click ⇒ what appears ⇒ confirm ⇒ the request — and
leave the wording, the doors and the pure rules to the fast tests. If a control's dialog has a refusal path, click that too:
it is where "renders" and "works" diverge most often.

### Definition of Done
- [x] One harness chosen **with the reasoning stated** (and Playwright's rejection argued for this job)
- [x] A real click ⇒ dialog ⇒ confirm ⇒ request on the Undo, **two states** plus a refusal and a no-control row
- [x] TASK-531's named gap **closed** (the `onClick` wiring and the paint), with what is still outside any harness named
- [x] The existing suite **not converted** · **run time before and after stated (1.6s → 2.8s)** · the when-to-use note written
- [x] **635 / 0** · `tsc` 0 · build ok

### ⚠️ Not seen on a screen
Nothing changed in the product — this task only adds tests and their harness. For @Tanya nothing new to check; her TASK-531
run remains the confirmation that the real browser agrees with the harness.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27). **The rule is now enforceable.**
Verified by me: **635 pass / 0 fail across 68 files in 2.68 s** · tsc 0 · build ok · the four devDependencies present. **Her stated cost is accurate: I measured 2.68 s against her 2.8 s.**

✅ **The choice is argued rather than asserted, and the rejection is the better half:** `happy-dom` + testing-library **inside Bun's own runner — no second command, no CI change, ~300 ms per DOM file** · 🚫 **Playwright rejected FOR THIS JOB and not in general**, because *"does this button do anything" has to answer in the same second as everything else or nobody waits for it.* 🔑 **That is the right reason to reject a better tool: not that it is worse, but that its cost falls on the wrong question.**
✅ **And she checked "heavier than the problem" before installing**, which was the outcome I explicitly permitted — **one preload and four tests**, and she kept going only because **it caught a real bug in its first hour.**
🔑 **My gap is closed and she names exactly which part:** a real `userEvent.click` ⇒ **the dialog found on screen (the paint)** ⇒ a real click on confirm ⇒ **the request asserted at the boundary**, for the check-in state and the leave state (**with a reason typed into the textarea arriving in the body**), plus a **refused** act (**the dialog still open**, one attempt, no success) and a **CONFIRMED** row with **no control to click.**
⚠️ **And the new boundary is named so "clicked" does not come to mean "seen":** the real browser's CSS, focus, z-index and a phone's tap are outside **any** DOM harness. **Stating the next limit rather than letting the previous one look closed.**

## 🔑 The find in its first hour is worth more than the harness: **`mock.module` is global to the test PROCESS**
Her first version returned only the members her file needed from a shared hooks module and **silently deleted the rest for every other file in the process** — two unrelated suites failed with *"Export named … not found"*. **Every mock now spreads the real module and replaces one member**, with the reason in the file.
📌 **This is a whole-team fact, not an FE one: the backend uses `mock.module` in five files.** ⇒ **TASK-533 (BE, XS)** to make them spread and pin the rule. 🔑 **The failure mode is the dangerous kind — it breaks a FILE YOU ARE NOT LOOKING AT**, and the message points at the innocent file rather than at the mock that caused it.
✅ **And the boundary is written at the top of the file people will copy from** — *a `.dom.test.tsx` is for a CONTROL, not labels, not layout* — **which is the only place a rule like that survives.**
