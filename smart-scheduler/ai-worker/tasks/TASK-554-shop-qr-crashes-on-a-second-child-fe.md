# TASK-554 — 🔴 D7: the shop-QR page crashes when a second child is ticked — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-29) · **Size XS.** 🔴 **BLOCKER — sid does not go until this is fixed.** Tanya, `qa-2026-09-28/SQ-2-both-ticked.png`, console: `Cannot read properties of null (reading 'checked')`.

## §0 ⚠️ A naming correction first, because it caused this delay
**"D7" means TANYA'S findings.** **D7 = this crash.** 📌 **I wrongly used "D7" in TASK-551/552 for the Undo forecast miss** — that item is **"the forecast miss (`UNDO_PLAN_WOULD_CHANGE`)"** and nothing else. **The board is corrected.** 🔑 *Two things under one label cost a day, and the day was mine to lose.*

## §1 The defect — @Porter's pointer, and I confirmed it in the file before cutting this
**`src/components/partials/Checkin/ShopfrontCheckinContent.tsx:233`:**
```
onChange={(e) => setTicked((prev) => (e.currentTarget.checked ? [...prev, itemKey(item)] : prev.filter(...)))}
```
🔑 **`e.currentTarget` is read INSIDE the `setTicked` updater — a callback React may run after the event has been released, when `currentTarget` is null.** **The first tick often survives; the second re-renders and the deferred updater finds nothing.** ⇒ **The page dies on the exact action a parent takes when they have two children at the shop front.**
- ✅ **The fix is to read the value BEFORE the updater** (`const next = e.currentTarget.checked;` then use `next`). **Yours to shape** — 🔑 **the rule is that nothing inside a state updater may touch the event.**
- ⚠️ **Sweep for the same shape elsewhere and say what you found.** 🚫 **Fix only what is this bug**; anything else is a finding. *This pattern reads as correct and is the kind that exists in more than one place.*

## §2 The proof I want, and it is the point of the task
🔑 **A clicked test: tick child A, tick child B, SUBMIT — through the real component.** ⚠️ **A render-only test would have passed on the broken code**, which is TASK-518's lesson and TASK-531's. **The control is proven by clicking it.**
✅ **And pin the console:** *the test must fail if the component throws*, not merely if the list is wrong.
📌 **This page is PUBLIC and unauthenticated** — a parent at the shop front hits it with no staff nearby. ⇒ **It gets the clicked test whatever the fix's size.**

## §3 Not in scope
🚫 No redesign of the page · no change to what check-in does · no BE change.

## Definition of Done
- [ ] Nothing inside a state updater touches the event · 🔑 **clicked test: two children ticked AND submitted, through the real component**, failing on a throw · the same-shape sweep reported (**fixed: only this one**) · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — including **restoring the deferred read** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-29): the shop-QR crash is fixed and clicked · **717 / 0** (was 710 · +7) · tsc 0 · build ok · **2 mutations bite** · 🔴 **the sweep found the rule already written down — this is a RECURRENCE**

## §1 The fix
`ShopfrontCheckinContent.tsx` — the value is read **eagerly, in the handler body**:
```tsx
onChange={(e) => {
  const on = e.currentTarget.checked;
  setTicked((prev) => (on ? [...prev, itemKey(item)] : prev.filter((k) => k !== itemKey(item))));
}}
```
🚫 **Not `e.currentTarget?.checked`.** That stops the crash and **silently records the wrong thing** — and a tick that quietly does nothing is worse than a stack trace, because nobody reports it. **Mutation J2 is exactly that "rescue", and it bites.**

## §2 🔴 The sweep — and it is the finding, not a formality
**Two hits in `src`, and the second one is the story:**
1. `ShopfrontCheckinContent.tsx:233` — this bug. **Fixed.**
2. **`lib/scheduler/other-booking.ts:76` — a COMMENT, showing this exact line as *"← the defect"*.**

⇒ 🔑 **This is TASK-237 returning (REQ-078 DEF-1/DEF-5).** That task diagnosed the same shape in the อื่นๆ form after it *"killed the page while staff were editing it, losing everything they had typed"*, and wrote the mechanism down in prose, **including why it survives review**: `dispatchSetState` has an eager path that runs the updater inline when nothing is pending — so **the first interaction usually works** and the second, with an update already queued, is deferred into the render phase where `currentTarget` is null. **That is precisely "the first tick survives, the second dies."**

📌 **The rule existed, in a good comment, and prose did not stop it coming back nineteen tasks later on a public page.** 🚫 **No other live site has the shape** — so, per §1, **I fixed only this one.**

## §3 ✅ What I added so there is no third time
`src/lib/ui/event-in-updater.test.ts` — **a repo-wide sweep** over every non-test `.ts`/`.tsx` in `src` (comments stripped, so the prose that documents the defect does not trip it):
- 🚫 no `setX((prev) => … e.currentTarget/e.target …)` anywhere, **and a failure NAMES the file**;
- 🚫 no `e.currentTarget?.` optional-chain rescue either;
- 📌 and it pins that **the explanation stays discoverable** in `other-booking.ts` — the sweep says *what*, the prose says *why*.

⚠️ **Declared: this is a new test, not a second fix.** It changes no other component. I judged it in scope because **the task's rule — *nothing inside a state updater may touch the event* — is worth exactly as much as its enforcement**, and this is the cheapest enforcement that exists (0.2 s, no DOM).

## §4 🔑 The clicked proof — and it fails on the THROW
`shopfront-checkin.dom.test.tsx`, through the real component with a faked fetch boundary:
1. **tick A → tick B → SUBMIT**: no throw, both boxes checked, and `POST /checkin/shopfront/batch` carries **`["bk-a","bk-b"]`, in the order asked.**
2. **un-tick** is eager too (the second child comes off, the first stays), and a single remaining child still goes down the **single** route untouched.
3. the source rule, pinned by value **and by absence**.

✅ **Restoring the deferred read (J1) makes the page throw in the harness**, verbatim: **`TypeError: null is not an object (evaluating 'e.currentTarget.checked')`** — the same defect Tanya's console reports as *"Cannot read properties of null (reading 'checked')"* (JSC's wording versus V8's). ⇒ **the test fails on the crash itself, not merely on a wrong list**, which is what §2 of the task asked for.
📌 **A render-only test would have passed on the broken code** — it renders perfectly, and the first tick works. That is the whole reason this file exists.

## §5 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= ShopfrontCheckinContent.tsx  28ec2885a2759ad2bf04f3f8b7d9bdfc
```
| # | mutation | result |
|---|---|---|
| J1 | **the deferred read restored** (the bug, exactly as Tanya hit it) — the task's required mutation | **4 tests fail, and the page THROWS** `null is not an object (evaluating 'e.currentTarget.checked')` |
| J2 | the optional-chain "rescue" (no crash, wrong value) | **4 tests fail** — including the sweep's own optional-chain pin |

Both bite; neither slipped; **CHECKSUM: the file is byte-identical to baseline afterwards.**

## §6 Verification
**717 pass / 0 fail across 76 files in 5.4 s** (was 710/74 ⇒ **+7 tests, +2 files**) · **tsc 0** · **`bun run build` ok** · 🚫 no page redesign, no change to what check-in does, no BE change, no deploy request.
⚠️ **What I have NOT proven:** the same limit as every DOM test here — CSS, focus and a real phone's tap. **The crash and the request are proven; that the two rows are comfortably tappable on the counter's device is Tanya's.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-29)
Verified: **717 pass / 0 fail** across 76 files · tsc 0 · build ok. 🔴 **The sid blocker is clear.**

## ✅ The fix, and the wrong fix she refused
**The value is read eagerly in the handler body.** 🚫 **Not the optional chain** — 🔑 **`e.currentTarget?.checked` would have stopped the CRASH and recorded the WRONG THING SILENTLY**, and *a page that quietly ticks the wrong child at a shop front is worse than a page that falls over.* ✅ **That mutation bites**, so the rescue cannot creep back in.
✅ **The clicked proof fails on the THROW** — restoring the deferred read reproduces **Tanya's crash in JSC's own wording.** Tick A → tick B → SUBMIT, both ids in the batch, in order. 📌 **A render-only test would have passed on the broken code.**

## 🔴 The finding that outranks the fix: **this is TASK-237 coming back**
**The sweep's second hit is a COMMENT in `lib/scheduler/other-booking.ts` showing this exact line as "← the defect".**
⇒ 🔑 **TASK-237 (REQ-078 DEF-1/DEF-5) diagnosed this mechanism, wrote down WHY IT SURVIVES REVIEW — the eager `dispatchSetState` path makes the FIRST interaction work and defers the second into the render phase — and it came back nineteen tasks later on a PUBLIC page.**
📌 **That comment describes "first tick survives, second dies" a month before Tanya hit it.** ⇒ **We did not lack the knowledge. We lacked a test.**

## ⚖️ Her declared addition — **`lib/ui/event-in-updater.test.ts`: ACCEPTED, and it should have been in my §1**
✅ **A repo-wide sweep, comments stripped so the documenting prose does not trip it, a failure that NAMES the file, and the optional-chain rescue refused too. It changes no component.**
🔑 **Her reason is the ruling: "the rule is worth what its enforcement is worth, and prose has now failed at this once."** ⇒ **I wrote §1 as "sweep and report" — a report is prose, and prose is exactly what failed here.** **Keeping it as its own file, offered as liftable, is the right way to take a judgement call.**
📌 **Recorded in `SYSTEM-FACTS.md`.**
⚠️ **Not proven, correctly named: CSS / focus / a real phone's tap ⇒ Tanya's.**
