# TASK-651 — FE: **the admin's leave result speaks to the ADMIN · the "ticked sessions" line leaves the door with no ticks · and the filed test list** (QA items 2, 3, 5) 🔴 **BLOCKS uat**
**From @Sober to @Fern.** **All in your files: `Calendar/Modal/ReportLeaveDialog.tsx`, the dictionary (Team A's write), and your own mutation set.**

## 1. 🔴 Item 5 FIRST — **the one-line filed-test-list fix, outstanding since this morning**
**`scripts/mutation/task-634.json.pending-637` lists two files; it must also list `group-swap-rate-key-revoked.dom.test.tsx`.** **With the list as filed, `R8` SURVIVES; with the missing file it is 11/11 — I verified it the long way twice.**
🔑 **@Porter's words: your CODE is proven; the RECORD of how to prove it is short — and that ends now.** ▶️ **Fix it, re-run it from the file's own list, and send me the count.** *(`TASK-637`'s port is still after the batch.)*

## 2. 🔴 Item 3 (F5) — **a BEHAVIOUR fix, no new words**
**`teacherLeave.warning` — *"Families of the ticked sessions will be told…"* — renders on `!advance`.** **On the ADMIN door, picking today makes `advance` false, so the line appears on a door that has NO ticks — and where today is now REFUSED at the server anyway.**
▶️ **The line belongs to the CANCEL act, and the cancel act happens only on the TEACHER's own door.** ⇒ **show it only when `!advance && !subject`.** 🚫 **No rewording: it is right where it appears; it was appearing in the wrong place.** 🔑 *Your own TASK-595 comment already says it belongs to the cancel act only — this is the second door that comment did not cover.*

## 3. 📋 Item 2 (F4) — **the admin's RESULT reuses FOUR teacher strings, not one**
**After an admin records a day, the result block prints `advanceTitle` ("…you are recorded as away"), `advanceBlocked` ("…with YOU that day"), `advanceClasses` ("…an admin will handle them" — on the admin's own screen) and `advanceNoClasses` ("…with YOU").** ✅ **`advanceAlready` is neutral and stays shared.**
▶️ **Four admin variants, chosen by `subject` exactly as `adminNothingCancelled` already is.** 📋 **DRAFTS below — mine, NOT approved: build them marked `📝 DRAFT (Sober, TASK-651)`, and 🚫 do not ship until @Porter brings them back approved.**
| key | EN | TH |
|---|---|---|
| `adminAdvanceTitle` | **{date} — leave recorded for {name}** | **{date} — บันทึกวันลาของ {name} แล้ว** |
| `adminAdvanceBlocked` | **No new class can be booked with {name} that day.** | **จะไม่มีการจองคาบใหม่กับ {name} ในวันนั้น** |
| `adminAdvanceClasses` | **{n} class(es) already booked with {name} that day:** | **มีคาบที่จองกับ {name} ไว้แล้ว {n} คาบในวันนั้น:** |
| `adminAdvanceNoClasses` | **Nothing is booked with {name} that day.** | **วันนั้นยังไม่มีคาบที่จองกับ {name}** |
🔑 **The classes line deliberately does NOT say "yours to handle" — `adminNothingCancelled` directly below already does, and a promise said twice is one edit from saying two different things.**

## 4. ✅ Done means
1. **`tsc` · `bun test` · `build` — all clean, with COUNTS.**
2. **DOM tests: the admin result shows NONE of the four teacher strings and ALL four admin ones · the teacher's own door is byte-for-byte unchanged · the cancel warning is ABSENT on the admin door with today selected, and PRESENT on the teacher's own door with today.**
3. **Both languages COUNTED. A mutation that swaps one admin key back to the teacher's must BITE.**
4. **Item 5's count, from the file's own list.**

---

# 📋 REPORT — @Fern → @Sober (2026-10-04)

**tsc exit 0 · suite 964 pass / 0 fail across 105 files · build exit 0.** **Break-and-watch: 24 mutations in the TASK-611 set (A1–A24), 24 BITES · 0 SURVIVED · 0 NO RESULT, baseline 44 clean, CHECKSUM identical.**

## §1 ✅ Item 5 — the filed list, fixed, and the count you asked for
**`task-634.json.pending-637` now lists FIVE files, including `group-swap-rate-key-revoked.dom.test.tsx`.** **Re-run with the list read OUT OF THE FILE** (`--tests "$(node -e '…pending-637…tests.join(" ")')"`, so the list I ran is provably the list I filed):
**baseline 38 clean · 11 mutations · 11 BITES · 0 SURVIVED · 0 NO RESULT · CHECKSUM identical.**
⚠️ **And you were right about the deeper point, which is worse than the omission:** **I parked the list specifically to avoid this failure, and the list I parked by hand was still wrong.** ⇒ 🔑 **writing it out by hand IS the failure mode**, and `TASK-637` has to make the set carry a list that is **checked, not typed**. 📌 I also added the two source-pin files (`group-session.test.ts`, `series-scope.test.ts`) — they hold R9/R11's copy pins, so the list now matches what actually proves the set.

## §2 ✅ Item 3 (F5) — one condition, no words
**`{!advance && !subject && …}`.** The line promises the **ticked** sessions' families are told, and 🔑 **the cancel act happens only on the teacher's own door** — on the admin door today makes `advance` false, so it rendered on a screen with **no ticks at all**.
📌 **And the thing I want on the record, because it is the same shape as the TASK-611 §2 defect you caught:** **my own TASK-595 comment already said that line belongs to the cancel act only.** ⇒ ***a rule written down for one door does not travel to the next by itself*** — the sentence I wrote to prevent exactly this did not prevent it, because the second door did not exist yet when I wrote it.
**Pinned both ways:** absent on the admin door with today selected (and 🚫 no ticks there to have been talking about) · **present on the teacher's own door with today** — **A23 silences it everywhere and bites**, which is *half a rule is not a rule* as a row.

## §3 ✅ Item 2 (F4) — four admin variants, your drafts, the owner's words
**All four shipped exactly as approved, in both languages**, marked `✅ APPROVED (owner 2026-10-04, TASK-651)` — 🚫 **not reworded on the way in, not even where I would have phrased one differently:** 🔑 *an approved string "improved" on the way in is an unapproved string.*
✅ **`advanceAlready` stays SHARED** — it is neutral, and pinned as such so it cannot quietly become a fifth variant.
📌 **The classes line does not repeat "yours to handle"**, and that omission is pinned too, with the owner's approval as its reason — *a promise said twice is one edit from saying two different things.*
**Chosen by `subject`, exactly as `adminNothingCancelled` already is** — 🚫 no second mechanism for the same decision.

## §4 The proof
- **The admin result shows ALL FOUR admin sentences and NONE of the teacher's four**, asserted against the dictionary's own values rather than retyped prose — **A18–A21 each swap one back and each bites.**
- **The empty-day case has its own test**, because `adminAdvanceNoClasses` only renders when nothing is booked.
- **The teacher's own door is byte-for-byte unchanged** (its tests are untouched and still green).
- **Both languages COUNTED: 13 admin keys now**, each present in both, each differing between them, and **each of the four carries `{name}`** — 🔑 *that placeholder is what makes "it names the coach" true, rather than the wording.* **A24 replaces an approved Thai string with the English one and bites.**

| # | mutation | verdict |
|---|---|---|
| A18 | 🔴 the title reverts to *you are recorded as away* | **BITES** 43/1 |
| A19 | 🔴 the blocked line reverts to *with YOU* | **BITES** 43/1 |
| A20 | 🔴 the classes line reverts to *an admin will handle them* | **BITES** 43/1 |
| A21 | ⚠️ the empty-day line reverts to *with YOU* | **BITES** 43/1 |
| A22 | 🔴 the cancel warning returns to the admin door | **BITES** 42/2 |
| A23 | ⚠️ the F5 fix overreaches and silences it everywhere | **BITES** 41/3 |
| A24 | ⚠️ an approved Thai string is replaced by the English | **BITES** 43/1 |
*(A1–A17 unchanged, all BITES.)*

## §5 Declared pin updates
**`teacher-scope.test.ts`** — the warning's condition (`{!advance && !subject && (`) and the `teacherLeave` copy count **27 → 31**, each with the reason written in. 📌 Under @Porter's `TASK-638` ruling the co-located test is mine with the file, so there is no claim question this time.

## Files
- **Edited:** `Calendar/Modal/ReportLeaveDialog.tsx` (four variants by `subject`; the F5 condition) · `lib/i18n/dictionaries.ts` (the four, both languages, approved) · `scripts/mutation/task-634.json.pending-637` (the list) · `scripts/mutation/task-611.json` (A18–A24).
- **Tests:** `admin-records-leave.dom.test.tsx` (the F4 and F5 blocks, the copy count 9 → 13).
- **Declared pins:** `lib/scheduler/teacher-scope.test.ts`.
