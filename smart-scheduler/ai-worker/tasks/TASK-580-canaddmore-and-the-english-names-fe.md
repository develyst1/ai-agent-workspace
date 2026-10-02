# TASK-580 — use `canAddMore` (closes D11 and F-B) + the garbled English names — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · **Size S.** @Jason's TASK-578 landed.

## §0 ⚠️ First
**Re-read the front repo and say so** — *it moved under you last task.* 🚫 **Palm's items 4, 9, 11.**

## §1 `canAddMore` — and it closes TWO of Tanya's findings
**`/register/status` now carries `canAddMore`: 0 children ⇒ true, the cap ⇒ false.**
🔑 **This closes D11's dead end AND Tanya's F-B** — *a linked family pressing เพิ่มนักเรียน and being told "already linked" is the same defect, not a separate one.* 📌 **F-B was filed as "next round, probably pre-existing"; it is neither.**
- **Read it; do not infer it.** 🚫 **Never derive "can they add?" from the child count on the page** — 🔑 *the server knows the cap and the page does not.*
- ⚠️ **Say what a family at the cap sees** — **a reason, not a dead button.** *A disabled control with no sentence is the dead end in a quieter costume.*

## §2 🟠 F-D — the question @Jason's diagnosis leaves
**The address package ships garbled English (*"Khnong Tntnai"*). The Thai is correct and we store only Thai.**
🔑 **So: does ANY screen show those English names to a parent or an admin?** ⚠️ **Derive it, do not glance.**
- **If nothing shows them ⇒ say so and stop. Nothing to fix.**
- **If something does ⇒ show Thai only.** 🔑 **Correct data displayed wrongly is still a defect the customer sees** — and 🚫 **do not "fix" the package's strings; we do not own them.**

## §3 The proof
🔑 **Clicked: a 0-child linked family reaches the add form** · **a family at the cap sees the reason and NO request goes out** · **and assert `canAddMore` is READ, not computed** (a mutation that derives it from the child list must bite).

## Definition of Done
- [ ] `canAddMore` read and honoured, **D11 and F-B both closed** · the cap state gives a **reason**, not a dead button · F-D's display question **derived and answered**, Thai-only if anything shows them · 🔑 clicked: 0-child reaches the form · cap ⇒ no request · **a mutation deriving `canAddMore` locally bites** · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch, CHECKSUM · report + `inbox/SA.md` + log.

---

# 📤 REPORT — @Fern → @Sober (2026-09-30)

## §0 ✅ Front repo re-read first
🚫 Not from memory. `git log` read only — **no new commit since TASK-577** (`ffa8e9f` is still the tip), so the tree is the one I left, plus my own uncommitted work. I re-read the register page, `lib/register/api.ts`, `entry.ts` and **@Jason's TASK-578 route** to see the field's own rule before using it. 🚫 Palm's items 4, 9, 11 untouched.

## §1 `canAddMore` — read, and it closes both
**The field is the server's:** `childCount < MAX_STUDENTS_PER_PARENT`, computed where the cap lives. **This page does not know the cap and now never guesses it.**
- **`StatusResult` carries it** (the type was the first thing that had to change, or the reader would have been a cast).
- 🔴 **D11: a linked family with ZERO children now lands on the FORM** — the same rule `afterLink` already used for the link path. **Before, it met a screen offering only *unlink* or *close*: nothing it could do, on the page whose whole purpose is to register a child.**
- 🔑 **F-B is the same defect, and the same line fixes it:** a linked family **with** children gets *"เพิ่มนักเรียน"* on that screen, which walks into the form. 📌 **It was filed as "next round, probably pre-existing" — it is neither.**
- ⚠️ **At the cap the family gets the SENTENCE, not a dead control** (`register.familyFull`, the string the linked screen already uses — one sentence, two screens). 🚫 **There is no disabled button at all**: *a dead control with no explanation is the same dead end in a quieter costume.*

## §2 🟠 F-D — derived, and the answer is "yes, exactly one screen"
🔑 **Derived three ways, not glanced at:**
1. **The package is imported in ONE place** — `entry.ts`, dynamically (`await import("thai-address-universal")`), and a test already pins that no other file may import it.
2. **`AreaPick` is consumed by ONE component** — `RegisterContent`, the **parent-facing** register form: three address `Select`s.
3. **`nameEn` had exactly ONE reader in the whole tree** — that component's option label, `lang === "th" ? r.nameTh : r.nameEn`. **Nothing admin-facing touches the package at all** (admin screens show addresses as the Thai strings we stored).
⇒ **The garbled English reached a parent's dropdowns in EN mode, and nowhere else.**
✅ **Fixed: Thai names in both languages** (the field LABELS are still translated — only the area names are not). 🚫 **We did not patch the package's strings, and 🚫 did not transliterate our own.**
🔑 **And `nameEn` is DELETED from `AreaPick`, not left unused:** an unused garbled field is a reader waiting to happen, so **a future reader is now a compile error** — TASK-545's rule, reused.

### 🔴 The part that is not mine: this reverses the OWNER
**TASK-351 had Thai in both languages. TASK-355 §10.2 changed it to English in EN mode *because the owner asked for it*** ("ตัวเลือก … ข้างใน dropdown เป็นภาษาไทย แม้จะเปลี่ยนภาษาเป็นภาษาอังกฤษ"). **TASK-580 puts it back to Thai.**
🔑 **The owner asked for READABLE English; this dataset cannot supply it** (*"Khnong Tntnai"* for คลองตันเหนือ) — and garbled English on a parent's phone serves his intent worse than Thai does. ⚠️ **But it is still his decision, so it is declared in the pin itself and I am asking you to carry it up.** 📌 **If he wants English back, the honest options are a different dataset or our own transliteration — both are work, and both are his call, not a patch on a package we do not own.**

## §3 The proof — 🔑 clicked, five states, all driven by the answer
- 🔴 **zero children ⇒ the FORM**, no already-linked screen, **and only the `status` read has left the app**;
- 🔑 **children + `canAddMore` ⇒ the button, and clicking it reaches the form**;
- ⚠️ **at the cap ⇒ the reason, NO button, and no request**;
- 🔴 **and the two that make "read, never derived" a fact rather than a claim: `childCount: 1` with `canAddMore: false` ⇒ the reason** (a local sum would have offered the button) **and `childCount: 9` with `canAddMore: true` ⇒ the button** (a local sum would have refused it). *Both contradict what a page computing the cap would conclude.*
📌 **And one comment corrected on the way:** the DOM harness said *"the `already-linked` screen is a dead end BY DESIGN (unlink or close)"*. **It was not by design — it was D11 and F-B.** 🔑 *That is your new standing habit in its first live outing: the note covering the dead end was describing it approvingly.*

## §4 🔑 Break-and-watch — 8 mutations, all BITE
`scripts/mutation/task-580.json` · **BASELINE 93/0, 563 B green** · **CHECKSUM identical.**

| # | mutation | verdict |
|---|---|---|
| A1 | 🔴 `canAddMore` DERIVED from the child count | ✅ BITES 90/3 |
| A2 | 🔴 D11 — the zero-child family back to the dead end | ✅ BITES 91/2 |
| A3 | 🔴 F-B — the way forward disappears | ✅ BITES 91/2 |
| A4 | ⚠️ the cap becomes a dead button | ✅ BITES 91/2 |
| A5 | 🔴 F-D — the garbled English returns to the dropdowns | ✅ BITES 91/2 |
| A6 | the English name rides the row again | ✅ BITES 91/2 |
| A7 | 🚫 what is STORED starts following the label | ✅ BITES 90/3 |
| A8 | the status type drops the server's answer | ✅ BITES 92/1 |

### ⚠️ A2 bit for the WRONG REASON first, and I re-ran it
**My first A2 deleted the whole `if` line and left a dangling `else`** — a syntax error. It reported `82 pass / 2 fail`, which **is** a bite by the rule (fewer passed than the baseline), **but the file simply failed to load: nothing was proved about the pin.** ✅ **Rewritten as a dead condition (`if (false && …)`) and re-run: 91/2, the tests themselves failing.** 📌 **A mutation that does not compile proves nothing except that it does not compile** — and a runner that scores `pass < baseline` as a bite will happily let me believe otherwise. *The rule is right; my mutation was lazy.*

## §5 Verification
**858 pass / 0 fail across 90 files** (was 853/90 ⇒ **+5 clicked tests**) · **tsc clean** · **`bun run build` ok** · mutation pass **CHECKSUM identical**.
🚫 No SQL, no database, no environment · no BE change · no deploy request · git read only. 📋 **No new copy** — both sentences (`addChild`, `familyFull`) already existed and are reused. 🔑 **One string became REACHABLE that never was**: `familyFull` was only rendered on the post-link list, so *the cap sentence existed and no family at the cap could see it on the already-linked screen.*
⚠️ **Declared: six existing pins updated, none weakened** — the `lang`-occurrence count (4 → 3), the §8b label pin (now Thai, with the owner reversal declared in the test file itself), the `nameEn` count (1 → 0), the §10.2 "rides the row" pin (inverted: the field is gone), the `initLiff` phase pin (+ the zero-child branch and `canAddMore`), and the status-payload type pin.
⚠️ **Not proven by me:** CSS, focus and a real tap · what a LINE in-app browser does with the Thai labels in EN mode (it is the same string either way, so nothing new) · **and §2's reversal is the owner's to confirm.**

**Ball: @Sober — with §2 for the owner.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · ⛔ **§2's reversal goes to the owner**
Verified by me: **858 pass / 0 fail** across 90 files · tsc 0 · build ok.

## ✅ §1 — and one string became REACHABLE that never was
**`canAddMore` is read, never derived, and THE TYPE CHANGED FIRST** — *otherwise the reader would have been a cast.* 🔴 **A zero-child linked family now lands on the FORM**; before, it met a screen offering only *unlink* or *close* — 🔑 **nothing it could do, on the page whose whole purpose is registering a child.**
🔑 **`familyFull` existed and no family at the cap could ever see it on that screen.** ⇒ **The cap now gets THE SENTENCE and 🚫 no disabled control at all** — *one sentence, two screens.*
✅ **And the two tests that make "read, never derived" a fact:** **`childCount: 1` + `canAddMore: false` ⇒ the reason** (a local sum would have offered the button) **and `childCount: 9` + `canAddMore: true` ⇒ the button** (a local sum would have refused it). 🔑 **That is how you prove a value is obeyed rather than recomputed.**

## ✅ §2 — derived three ways, and the field DELETED
**The package is imported in ONE place (a test already forbids another importer) · `AreaPick` has ONE consumer, the PARENT-facing form · `nameEn` had exactly ONE reader.** ⇒ **the garbled English reached a parent's dropdowns in EN mode and nowhere else. Nothing admin-facing touches it.**
✅ **`nameEn` DELETED from `AreaPick`, so a future reader is a compile error** — 🔑 *"an unused garbled field is a reader waiting to happen."*

## ⛔ §2's other half — **the Thai stays now; the reversal is the owner's to confirm**
**TASK-355 §10.2 put English in EN mode BECAUSE HE ASKED FOR IT. This puts Thai back.**
⚖️ **My ruling: leave the Thai in place, and carry the reversal up as one he can overturn in a word.** 🔑 **Her argument is the right one: he asked for READABLE English, and this dataset cannot supply it** — *"Khnong Tntnai" for คลองตันเหนือ serves his intent worse than Thai does.*
✅ **Declaring it INSIDE THE PIN so nobody meets it as a silent flip is exactly right.** 📌 **And the honest alternatives are named: a different dataset, or our own transliteration — both real work, neither a patch on a package we do not own.**

## 📌 The new habit's first live outing — one day old
**The DOM harness's own comment said *"the already-linked screen is a dead end BY DESIGN (unlink or close)."*** 🔴 **It was not by design. It was D11 and F-B.**
🔑 **The note covering the dead end was describing it approvingly** — **exactly TASK-577's rule, firing within a day, found by the person who wrote the rule.** ✅ Corrected.

## ⚠️ §4 — A2 bit for the WRONG REASON, and she re-ran it
**Her first mutation deleted an `if` line and left a dangling `else`: a SYNTAX ERROR.** **It scored 82/2, which IS a bite by the count rule — but the file merely failed to LOAD and nothing was proved about the pin.**
✅ **Rewritten as a dead condition: 91/2, with the TESTS failing.** 🔑 ***"A mutation that does not compile proves nothing except that it does not compile."*** **Recorded** — *the counts rule is right; a non-compiling mutation is a void run inside it.*
