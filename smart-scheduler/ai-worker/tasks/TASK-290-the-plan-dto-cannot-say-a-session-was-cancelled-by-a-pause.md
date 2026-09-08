**Status:** DONE — code (Sober 09-08, reviewed) — tsc 0 / 1734 pass 0 fail / NO migration (35 = 35). The Thai literal appears exactly once. Three other CANCELLED-with-text paths asserted false using their real literals. Also fixed scheduler.service.ts:15.

# TASK-290 — the plan DTO cannot say a session was cancelled BY A PAUSE

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
**Source:** @Fern's §3 answer on TASK-289 — she stopped and asked rather than inferring it. ⛔ **TASK-289 waits
on this; `uat` waits on both.** 🚫 **NO MIGRATION** — nothing new is stored.

---

## §1 The gap, in two lines
- `dropCourse` writes `.set({ status: "CANCELLED", note: "พักคอร์สชั่วคราว" })` (`scheduler.service.ts:3742`).
- `toSessionRow` (`:1774`) carries `id · date · startTime · status · bookingType · teacher · subject ·
  attendeeNote` — **and not `note`.**

⇒ **The screen cannot tell a pause-cancelled session from any other cancelled one**, so the plan modal shows
**8 rows for a 4-session course** and nothing on the client can filter it honestly.

## §2 🔴 Add a BOOLEAN, derived. Do NOT ship the note.
**`cancelledByPause: boolean`** on `toSessionRow`, computed from the note the row already carries.
🔴 **@Fern's reason, and it is the ruling:** shipping the Thai sentence means **the FE matches on
`"พักคอร์สชั่วคราว"` — two copies of one string in two repos, one of them a UI-language literal.** ⇒ **the drift
class this project has spent the week paying for.** **A string comparison across the wire is no safer than a
date heuristic.**
✅ **The Thai stays server-side. The client receives a fact, not a sentence.**

## §3 ✅ Restore the constant you deleted — and this one is on me
**`COURSE_PAUSE_NOTE` was `course-plan.ts:203`**; you removed it with §5's withdrawn reviving design (your §8.1)
— **correctly, because nothing read it then.** **Something reads it now.**
⇒ **Bring it back, and have BOTH sides use it: `dropCourse`'s write and this derivation.**
🔴 **Two inline literals of the same Thai sentence, in one file, compared to each other, is the defect this task
exists to prevent — one layer down.** 📌 **I told you it was "already a named constant" in TASK-282 §7. It was,
when I wrote that; it was not by the time @Fern looked.** **My sentence went stale inside a day.**

## §4 What must not change
- 🚫 **No migration. No new column.** The note is already stored; this only exposes a derived fact.
- 🚫 `dropCourse`'s behaviour, the status, the row, the counts.
- 🚫 The other `toSessionRow` fields, and **`attendeeNote` is NOT this** — REQ-068's *"who is bringing the
  child"*, a different field answering a different question. ⚠️ **They are one keystroke apart in a grep.**
- 🚫 `resumeCourse`, the re-plan, the derived expiry.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 **no migration** (35 `.sql`)
- [ ] `cancelledByPause` is on the plan DTO, **derived**, and **true only for a pause-cancelled row** — asserted
- [ ] 🔑 **A HAND-cancelled session is `false`** — asserted. **That distinction is the whole point of the field**
      and the reason we did not simply hide all cancelled rows.
- [ ] **`COURSE_PAUSE_NOTE` is restored and used by BOTH the write and the derivation** — asserted that the Thai
      literal appears **once** in the source
- [ ] 🚫 **The note itself is NOT on the DTO** — asserted, so the string cannot cross the wire later by accident
- [ ] 🚫 No migration · `dropCourse` and `resumeCourse` untouched

## Question
**Is `note` used for anything else on a booking?** It is a general column (`schema.ts`), and the pause happens to
write a sentence into it. 📌 *If another path writes a different sentence there, a row could be cancelled by
something else and still carry text* — **which is fine for a boolean that tests for ONE value, and not fine if
anyone later widens the test.** **Name the other writers; change none of them.**

---

## ✅ RESULT 2026-09-08 — @Jason. tsc **0** · **1734 pass / 0 fail**, 137 files · 🚫 **35 `.sql` = 35 journal tags.**

- [x] `tsc --noEmit` → **0** · `bun test` → **1734 / 0**, 137 files · 🚫 no migration (**35 = 35**, counted)
- [x] `cancelledByPause` on the plan DTO, **derived**, true only for a pause-cancelled row — asserted
- [x] 🔑 **A HAND-cancelled session is `false`** — asserted, with and without a reason
- [x] **`COURSE_PAUSE_NOTE` restored and used by BOTH** the write and the derivation — the Thai literal appears
      **exactly once** in the source, asserted per file
- [x] 🚫 **The note is NOT on the DTO** — asserted on the mapper body *and* on the contract type
- [x] 🚫 No migration · `dropCourse`'s behaviour, `resumeCourse` and the re-plan untouched

New: `src/lib/cancelled-by-pause.test.ts` (6 tests).

### What was built
`isCancelledByPause(b)` in `course-plan.ts` — `status === "CANCELLED" && note === COURSE_PAUSE_NOTE` — read by
`toSessionRow`, which now carries `cancelledByPause: boolean`. `PlanSessionRow` gains the field, so TASK-184's
compiler guard covers it: a future mapper that drops it is a build error, not a silent gap.
🔑 **The status is part of the answer, not decoration.** No path writes that note onto a live row today, and
that is exactly why it is asserted: the field claims *cancelled by a pause*, so a `PENDING` row must never
satisfy it however its note reads.

### 🔑 The Question — **three other paths leave a `CANCELLED` row carrying text**, and none of them is a pause
| where | sentence | what it means |
|---|---|---|
| `scheduler.service.ts:2169` | `ยกเลิกคาบขยายอัตโนมัติ (ปรับแผนคอร์ส)` | the reconciler trimming an appended make-up |
| `scheduler.service.ts:3929` | `ยกเลิกคอร์ส (จบคอร์สก่อนกำหนด)` | a course ended early |
| `scheduler.service.ts:2623` | `cancelReason ?? current.note` | **a hand cancel, with the admin's own reason** |

⇒ **Your "fine for a boolean testing ONE value, not fine if anyone widens it" is exactly right, and it is now a
test rather than a warning.** The first two are asserted `false` using **the real literals from those lines**,
not invented ones — so widening the check to `note !== null` folds all three into "paused" and **fails two
tests, naming the case each time.**
🚫 **Changed none of them**, as instructed. 📌 The doc comment says where a second pause-like sentence would go
(a list of values), so the next person does not reach for `!= null`.

✅ **Break it and watch, and the REASON:** widening to `note != null` fails *"a HAND-cancelled session is
false"* **and** *"the OTHER two sentences are false"*. **That second failure is what tells me the mutation did
what I meant** — the field would have started lying about the reconciler and the early ending too, not merely
about one row.

### ✅ §3 — the constant, and the sentence about it
Restored at `course-plan.ts:211`, and **both sides read it**: `dropCourse`'s write and the derivation. The Thai
appears **once** in non-test source, asserted per file so a reintroduced copy fails here rather than on a
screen.
📌 **Your note about the note going stale inside a day is the same shape as the one below**, and both are worth
having on the record together.

### ✅ Also done — `scheduler.service.ts:15`, the comment that outlived its mechanism
It described *"the expiry edit's warning, the resume's warning and the resume's `EXPIRY_REQUIRED` gate."* Two of
those three no longer exist. Now it names the one caller left and **says why the others went** — a re-plan
derives the expiry from the sessions it lays out, so there is nothing to warn about.
🔻 **This week's lesson inverted, and worth naming as such:** every other instance was a TEST that outlived its
requirement. **This was a comment that outlived its mechanism** — and unlike a test, nothing can fail to tell
you.

**BALL: @Sober — TASK-290 ready for review. ⛔ TASK-289 and `uat` unblocked from my side.**

## Review — Sober, 2026-09-08: ✅ **PASS. TASK-290 is DONE. TASK-289 is unblocked.** 🔑 **And your Question answer turned my caution into a test.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **1734 pass / 0 fail**, 137 files · **35 `.sql`, no
migration** · `COURSE_PAUSE_NOTE` at `course-plan.ts:211`, `isCancelledByPause` at `:226`, `dropCourse:3749`
reads it · **the raw Thai appears exactly ONCE in non-test source** · `cancelledByPause` on the mapper (`:1789`)
**and on the contract type** (`:173`).

### 🔑 Three other paths leave a `CANCELLED` row carrying text — I asked for names and got assertions
| where | sentence | what it means |
|---|---|---|
| `:2169` | *ยกเลิกคาบขยายอัตโนมัติ (ปรับแผนคอร์ส)* | the reconciler trimming an appended make-up |
| `:3929` | *ยกเลิกคอร์ส (จบคอร์สก่อนกำหนด)* | a course ended early |
| `:2623` | `cancelReason ?? current.note` | **a hand cancel, with the admin's own reason** |

⇒ **My warning was *"fine for a boolean testing ONE value, not fine if anyone widens it."* You made that a
FAILING TEST instead of a sentence** — and **using the real literals from those lines rather than invented
ones**, so widening to `note != null` **fails two tests and names the case each time.**
🔑 **And the reason you gave for the break-and-watch is the right one:** *"that second failure is what tells me
the mutation did what I meant — the field would have started lying about the reconciler and the early ending
too, not merely about one row."* **A mutation that fails for one reason when it should fail for three is a
mutation you have not finished reading.**

### 🔑 The status is part of the predicate, and you said why unasked
> *"No path writes that note onto a live row today, and that is exactly why it is asserted: the field claims
> *cancelled by a pause*, so a `PENDING` row must never satisfy it however its note reads."*

**A field named for a compound fact must test the compound fact**, even when one half cannot currently be
violated. **That is the same class as the `--plan` that checked the module and not the binary** — and it is
guarded here before it can be true.
✅ **And putting it on `PlanSessionRow` brings TASK-184's compiler guard with it** — a future mapper that drops
the field is a build error, **not a silent gap.** **That is reuse of an existing control rather than a new one.**

### ✅ `scheduler.service.ts:15` — done, and your framing of it is the better half
> *"Every other instance was a TEST that outlived its requirement. This was a COMMENT that outlived its
> mechanism — and unlike a test, nothing can fail to tell you."*

🔑 **That is this week stated in one line, inverted.** We have spent days on tests defending retired decisions —
each of which eventually went red, or at least *could*. **A stale comment has no such mechanism at all.** ⇒ **it
is the only member of the family that is invisible by construction**, and the only defence is somebody reading
it. 📌 **Recorded, and it is why the two-line sweep was worth asking for rather than waving through.**

### 📌 On the constant going stale inside a day
You are right that it belongs on the record beside the comment. **I asserted `COURSE_PAUSE_NOTE` existed in
TASK-282 §7; you deleted it, correctly, in the same hours; @Fern found the gap.** ⇒ **three people were each
right in sequence and the artefact was wrong the whole time.** **That is what a note is, and it is why the fix
was to restore the constant rather than to be more careful.**
