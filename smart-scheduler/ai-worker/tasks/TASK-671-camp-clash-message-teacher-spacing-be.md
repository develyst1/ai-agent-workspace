# TASK-671 — the camp clash refusal writes `ครู {ชื่อ}` with a space (owner ruling) — BE, XS
- Source: owner ruling 2026-10-06 (relayed by Porter): **"a space ALWAYS, every site, no helper that decides by script"** ⇒ `ครู {ชื่อ}`. @Sober has the other five sites; **this one is Team B's** (`camp.service.ts`).
- Status: DONE (reviewed by Silver, 2026-10-06)
  - **Conditions:** (1) **that assertion only**, nothing else in the file; (2) flipped to assert the NEW value **by value**: `ครู ${…}` with the space, the whole sentence, not a loosened matcher and not deleted; (3) **in the SAME change as `camp.service.ts:284`**. Never two changes, never two tasks.
  - **Why it is yours (Porter):** a pin that marks "NOT DONE YET" belongs to whoever completes the work, because only that change can retire it atomically. If Team A flipped it first, their suite would be green on a lie; if the service moved first, the suite would go red for a reason that is not a defect.
  - 📌 Team A is being notified **through Porter** (SAs never message each other, PROTOCOL ORDER 14.2).
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-06)
- **Claim:** `src/services/camp.service.ts` **line 284 only** · `src/lib/camp-on-grid-req095-11.test.ts` **the one line that pins this sentence** (`:186`; it was `:177` before TASK-666) · ✅ `src/lib/camp-week-500-family-dedupe-req104.test.ts` **`:73` and `:95` only** (granted; found by Bob's grep).
  - 🚫 Nothing else.
  - 🚫 **No helper or function that decides spacing by script** (the owner ruled against it): a literal space.

## What to do
1. `camp.service.ts:284`: `` `วันที่ ${d.date} ${hour} ครู${coachName…} มีคาบแล้ว — …` `` → **`ครู ${coachName…}`**. One space, nothing else in the sentence changes.
2. `camp-on-grid-req095-11.test.ts:177` pins that sentence word for word (`ครูเอก`) ⇒ re-pin it to **`ครู เอก`**, with a `🔻 TASK-671` note. It must still assert the whole sentence, not a fragment.

## Definition of Done
- [ ] The pinned test is green with the space. **Break it and watch:** remove the space and the test goes red.
- [ ] Grep: no `ครู${` left in `camp.service.ts`.
- [ ] The suite with **no reachable database**, plus `tsc`. State Team A's work in the tree. Nothing committed.

## Implementation Notes
**Bob, 2026-10-06 — the edits are done; ONE test of Team A's is red because of them, and it is not mine to touch (see §Questions Q2).**

**What changed (`smart-scheduler-back`, nothing committed), exactly the four granted lines:**

| file:line | change |
|---|---|
| `src/services/camp.service.ts:284` | `ครู${coachName…}` → **`ครู ${coachName…}`**: a literal space, nothing else in the sentence, and a `🔻 TASK-671` note on the line's existing comment |
| `src/lib/camp-on-grid-req095-11.test.ts:186` | the pin now reads `ครู เอก`, still asserting the **whole** sentence (status, code and message), with a `🔻 TASK-671` note |
| `src/lib/camp-week-500-family-dedupe-req104.test.ts:73` and `:95` | the same one-space re-pin, each still the whole sentence (the unit assertion and the HTTP body), each with a `🔻 TASK-671` note (granted by Porter) |

- No helper that decides spacing by script: a **literal** space, as ruled.
- Nothing else touched. Grep: **0** `ครู${` left in `camp.service.ts`.

**Verified:**
- The two pinned files together: **25 pass / 0 fail** (the whole sentence is asserted in each).
- **Break it and watch:** I removed the space from `camp.service.ts:284` ⇒ **3 tests red** (the clash by-value test in `camp-on-grid`, and both `camp-week-500` assertions), 22 pass. Restored byte-identical (`cmp`) ⇒ 25 / 0.
  - ⚠️ This is a one-off hand check and is **not a filed set**: the claim says "nothing else", so I created no file. I can file `camp-clash-spacing-task671.mutations.json` if you want one under Porter's rule.
- `tsc --noEmit` → **exit 0**.

**🔴 The red: `src/lib/copy-kru-space-task659.test.ts:63`** (Team A's TASK-659; committed in `b31cbff`, not edited by me)
```
🚫 the sixth site is NOT touched here — `camp.service.ts` is Team B's, and keeps its old spelling until they route the approved rule
    expect(raw("src/services/camp.service.ts")).toContain("ครู${coachName.get(teacherId)");
```
- It is Team A's **hand-off marker**, a deliberate pin that this exact site keeps the OLD spelling until Team B routes the rule. TASK-671 *is* that routing, so the pin has to flip to `ครู ${coachName.get(teacherId)` (or be deleted, their call).
- It is **not in my claim** ("Nothing else"), it is **Team A's file**, and I never address Team A. So I stopped there and did not edit it.
- Everything else in the suite is green: **4178 pass / 1 fail** (full run, DB unreachable), and that one fail is this test.

**🔻 UPDATE (Bob, 2026-10-06, after the grant) — Q2 is answered and applied; the suite is GREEN.**
- **The fifth edit, exactly as granted** (Porter's three conditions): `src/lib/copy-kru-space-task659.test.ts:64`, **that assertion only**. It used to assert the OLD spelling (`toContain("ครู${coachName.get(teacherId)")`). It now asserts, **by value, the whole spaced sentence** in the source:
  `` toContain("`วันที่ ${d.date} ${hour} ครู ${coachName.get(teacherId) ?? teacherId} มีคาบแล้ว — ไม่ได้บันทึกอะไร`") ``
  - Not a loosened matcher and not deleted. It is stronger than before (a fragment became the whole sentence).
  - **Same change as `camp.service.ts:284`**: both edits are in this one TASK.
  - `git diff --stat` on that file: +1 / −1. A trailing `🔻 TASK-671` comment on the same line says it was flipped and why.
- ⚠️ **One leftover, left as granted:** that test's **title** (`:63`) still reads *"the sixth site is NOT touched here — … keeps its old spelling…"*, which is now untrue. The grant said "that assertion only", so I did not retitle it. It is Team A's to retitle, and the trailing comment on `:64` tells the next reader. A retitle is one line if Porter wants it carried.
- **Break it and watch, again, with the flipped pin included:** removing the space from `camp.service.ts:284` ⇒ **4 red** (the clash by-value test in `camp-on-grid`, both `camp-week-500` assertions, and the flipped TASK-659 pin on its own). Restored byte-identical (`cmp`).
- **Full suite (DB unreachable): 4179 pass / 0 fail across 321 files. `tsc --noEmit` → exit 0.** The tree also holds Team A's uncommitted work and my TASK-672 edits.
- `git status` (this TASK): `camp.service.ts` (+ its note), `camp-on-grid-req095-11.test.ts`, `camp-week-500-family-dedupe-req104.test.ts`, `copy-kru-space-task659.test.ts`. Nothing else, nothing committed.

### Q2 — for Silver (the same question, raised inside the notes so it sits beside the evidence; the Q1 thread is below)
- **Q2 (Bob → Silver → Porter, 2026-10-06):** may that one pin be flipped, and by whom? The change is one line: `"ครู${coachName.get(teacherId)"` → `"ครู ${coachName.get(teacherId)"`, and the test's own title should stop saying the site "keeps its old spelling".
  - If Porter grants it to Team B: I'll make that one-line edit and nothing else.
  - If it is Team A's to flip: it stays red until they do, and **TASK-671's code is complete either way**.
  - Until then the suite shows exactly this one red, whose name points here.
## Questions
- **Q1 (Bob → Silver, 2026-10-06): the sentence is pinned in a SECOND file the claim does not list. Nothing edited yet.**
  - `src/lib/camp-week-500-family-dedupe-req104.test.ts` quotes it twice: `:73` (`วันที่ ${TODAY} 11:00 ครูเอก มีคาบแล้ว — ไม่ได้บันทึกอะไร`) and `:95` (the HTTP body, `13:00 ครูเอก …`).
  - It is green today (7/0) and clean of Team A work. Changing `camp.service.ts:284` alone turns those 2 assertions red.
  - Also: the pin in `camp-on-grid-req095-11.test.ts` is now at **`:186`**, not `:177` (TASK-666 added lines above it).
  - **Ask:** may I re-pin `:73` and `:95` of that file to `ครู เอก`, the same one-space change, each still asserting the whole sentence, with a `🔻 TASK-671` note? Together with `camp.service.ts:284` and `camp-on-grid:186`, that is every pin of this sentence (`grep -rln "มีคาบแล้ว — ไม่ได้บันทึกอะไร" src` → exactly these three files).
  - I'm doing TASK-668 meanwhile and will finish 671 in minutes once you answer.
  > answer (Silver, 2026-10-06): **Correctly stopped, and your grep is the method I should have used (FAILURES F-011).** Verified: exactly three files carry the sentence. I have asked @Porter for `camp-week-500-family-dedupe-req104.test.ts:73` and `:95`, recommending YES for exactly your one-space re-pins, each still asserting the whole sentence. The camp-on-grid pin is at `:186` (claim corrected). 🚫 Do not edit `…req104.test.ts` until he grants it. Finish TASK-668 meanwhile.

## Review

**Silver, 2026-10-06 — ✅ DONE.**
- **Diff = exactly the grants:** `camp.service.ts:284` (one space), the camp-on-grid pin, req104 `:73` and `:95`, and Team A's `copy-kru-space-task659.test.ts:64`. That is 5 lines across 4 files, in ONE change.
  - The Team A assertion now checks the **whole spaced sentence by value** (not loosened, not deleted), in the same change as the service, as Porter ruled.
- **Grep:** no `ครู${` left in `camp.service.ts`.
- **Re-run by me, no database:** the three test files → **36 / 0**. Your full suite was 4179/0.
- 📌 **Left, correctly:** the test's TITLE (`:63`, "keeps its old spelling") is now untrue, but the grant was the assertion only. Flagged to Porter for Team A.
