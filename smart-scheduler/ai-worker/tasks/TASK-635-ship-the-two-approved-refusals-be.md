# TASK-635 — BE: **ship the two APPROVED refusals** (`§T-609-CAP`, `§T-629-MERGE`)
**From @Sober to @Jason.** ✅ **Both approved by the owner, 2026-10-04, through @Porter.** **Words are final; nothing in them is yours to adjust.**
🔑 **Small, and it closes the last copy debt in the batch.**

## 1. `§T-609-CAP` — the at-cap refusal (`DECLARED_ABSENCE_CAP`)
🔴 **Replaces the live draft, which promised an unlock that does not exist.**
**TH:** **คอร์สนี้ประกาศวันหยุดล่วงหน้าครบตามโควตาลาที่ซื้อไว้แล้ว {declared}/{quota} วัน — ถ้าต้องการมากกว่านี้ ต้องแก้โควตาลาของคอร์สก่อน หรือเริ่มเรียนแล้วจึงแจ้งลาตามปกติ**
**Pin by SHAPE, not by the string:** ✅ **must carry `{declared}` and `{quota}`** · ✅ **must name the course's leave quota as the lever** · 🚫 **must NOT contain the word ปลดล็อก.**
🔑 **Your own reasoning is why it reads properly and the owner took it: the cap is the SIZE OF WHAT THE CUSTOMER BOUGHT, not a lock on an action.**

## 2. `§T-629-MERGE` — one sentence for both swap-refusal cases
🔴 **This REPLACES a sentence that has already shipped** (TASK-428's *"วันที่ {date} ครูคนแรกไม่ใช่คนที่ระบุ"*) **and the one you drafted for the non-primary case.** ✅ **The owner ruled it knowing that.**
**TH:** **วันที่ {date} ครูที่ระบุไม่ได้อยู่ในตารางของวันนั้น**
🔑 **One sentence because from the admin's side it is ONE fact — the person you named is not on that session.** **The distinction between "not the primary" and "not on it at all" is OURS, not theirs.**
▶️ **Both call sites now raise the same sentence.** 🔴 **Prove there is exactly ONE producer of it** — *two copies of a merged sentence is the merge undone at the first edit.*
⚠️ **Re-read every pin that asserted either old sentence.** 🔑 **Your own rule: a pin you widen past must be re-read for WHAT IT IS NOW PROVING.** ⇒ **A pin asserting the old primary wording will go red; it must be updated with the REASON written in, not just the text swapped.**

## 3. ✅ Done means
**`tsc` clean · the no-DB suite with COUNTS · migrations balanced** · **both languages where a string has two** (🔑 *a bilingual assertion is satisfied by ONE language unless both are counted*) · **and the shape pins above, as pins, not as string equality.**
📌 **A mutation set is NOT required for this one** — ⚠️ **but if you add the one that drops `{declared}`/`{quota}` from the cap refusal, it will earn its keep later.** **Your call.**

## 4. 🚫 Not in this task
**Any other refusal's words** · **`TASK-633`** · **the candidate queries** · **`§T-G`, already shipped.**

## ✅ 2026-10-04 — @Jason: BOTH approved refusals SHIPPED, pinned by SHAPE
**`tsc` 0 · the DB-unreachable suite 3836 pass · 0 fail · 65 = 65 — no migration.** **Pins: `src/lib/approved-refusals-task635.test.ts`.**

### `§T-609-CAP`
**Shipped as approved, word for word.** **Pinned by shape, not by the string:** ✅ **`{declared}/{quota}` interpolated** · ✅ **the course's leave quota named as the lever** (`โควตาลาของคอร์ส`) · ✅ **the existing alternative kept** · 🚫 **no unlock** · 🚫 **nothing claimed about leaves remaining.**
⚠️ **My first "no unlock" check was WRONG and failed on CORRECT code:** it banned the word from the whole service, where **two other refusals use it rightly** — the freelance-budget one, and **`LEAVE_LOCKED`, where an admin unlock genuinely exists.** 🔑 **The claim is a CONTRAST, not a ban: the refusal for a cap that cannot be unlocked must not offer one; the refusal for a rule that can be must keep offering one.** **Both halves are now asserted.** 📌 **A file-wide ban would have deleted a TRUE promise in order to protect against a false one.**
✅ **The mutation you said would earn its keep already exists: `F9` in TASK-609's set strips the count out of this refusal — re-anchored on the new sentence and re-run: BITES (113 baseline, CHECKSUM identical).**

### `§T-629-MERGE`
**One sentence, both cases, and `NOT_ON_ROW` now takes only the date.**
🔴 **Exactly ONE producer, asserted three ways:** one definition · one call site · and **the phrase appears in no other source file.** ⚠️ **I also removed the `onExtra` parameter** — **a parameter that no longer changes the answer is a lie waiting for someone to use it** — while the BRANCH itself is untouched: which location `from` occupies still decides the act, it just no longer decides the words.
🚫 **Both replaced sentences are gone from the source**, including TASK-428's shipped one, and the owner's ruling is recorded at the code so the next reader knows a live sentence was replaced deliberately.

### ⚠️ Four pins went red, exactly as you said they would — each updated with the REASON, not the text
1. **TASK-629's "the primary path's sentence is the one it always was"** — it asserted TASK-428's shipped wording, kept word for word so a widening would not reword an existing refusal. **Now it asserts the merged fact, with why the old one was true-but-misleading written in.**
2. **TASK-629's extra-path message pin** — the draft I wrote is gone too; the claim it carries was never the wording but that the refusal names WHICH date broke the run.
3. **TASK-609's set (`F9`)** and **4. TASK-629's set** — re-anchored, notes added in both files.
📌 **And two more pins moved for a reason that is not copy at all:** the longer sentence made me wrap `throw conflict(` onto two lines, which broke **`pre-start-declared-absence-task609`** and **`extension-ceiling`** — both asserted the single-line layout. **Narrowed to the CODE being raised, since the layout was never the claim.**
⚠️ **One of mine, caught by its own medicine:** my new pin sliced the region with `SCHED.indexOf('conflict("DECLARED_ABSENCE_CAP"')`, which after the wrap returned **-1** — and `slice(-1, …)` quietly returned `""`, so every "the sentence contains…" assertion would have passed **vacuously**. **The anchor is now checked before it is sliced on.** 🔑 ***A silent anchor does not stop speaking; it starts lying*** — the same lesson as the four silenced pins, in my own new test, the same week.
✅ **And a stale `📋 DRAFT` marker beside the cap sentence is gone: it is the owner's wording now, not a proposal.**
