# TASK-647 — BE: **`teacherNotified` must be COUNTED, not hard-coded** (QA F2, TEST-077) 🔴 **BLOCKS uat**
**From @Sober to @Jason.** **Small, and it is the server half — @Fern's screen is already correct.**

## 1. 🔴 The cause, certain, four lines
```ts
async function notifyTeacherOfLeaveDay(teacherId, payload): Promise<number> {
  const teacher = await db.query.teachers.findFirst(...);
  await enqueueLine({ recipientType: "teacher", recipientLineUserId: teacher?.lineUserId ?? null, payload });
  return 1;   // 🔴 a constant — the result of enqueueLine is thrown away
}
```
**`enqueueLine` returns a `NotifyResult` that already distinguishes QUEUED from SKIPPED** — and for a coach with no LINE link it writes a SKIPPED row. **This function discards that and returns `1`.** ⇒ **`teacherNotified: 1` for `qatt75b` and `Bank`, so the admin reads "told" and does not phone a coach who was told nothing.**
✅ **@Fern's three states (`>0` told · `0` not told · absent ⇒ silence) are behaving exactly as built.** **The server is sending the wrong number.**

## 2. 📌 Why every check passed, and it is mine
**Your test asserted the SKIPPED row EXISTS. @Fern's test fed the screen a mocked `0`.** ⇒ **Each half was tested against its OWN idea of the contract; the SEAM was never tested.**
🔴 **And I "confirmed" the field against the server: I checked it was a NUMBER called `teacherNotified`. I checked its SHAPE, never whether it was COMPUTED.** 🔑 *A field verified for shape on one side and for meaning on the other has been verified by nobody.*

## 3. ▶️ The fix
**Return what actually happened: `1` only when a message was QUEUED to a reachable account, `0` when it was SKIPPED.** **Read it from `enqueueLine`'s own result — 🚫 never re-derive "linked or not" from the teacher row a second time.**
⚠️ **The LIFT uses the same function (`teacher_leave_lifted`) — it is fixed by the same line, and it must be pinned too.**

## 4. ✅ Done means
1. **`tsc` · the no-DB suite with COUNTS · migrations balanced.**
2. 🔴 **Value tests on BOTH doors' answers (record AND lift): an UNLINKED coach ⇒ `teacherNotified: 0` and a SKIPPED row · a LINKED coach ⇒ `1` and a QUEUED row.**
3. **Mutations, filed and named: the constant restored (must BITE) · the count read from the teacher row instead of the result.**
4. ⭐ **And one test that crosses the seam: the server's answer for an unlinked coach, fed to the shape @Fern's screen reads, produces the NOT-told state.** 🔑 **That is the test that did not exist.**

## ✅ 2026-10-04 — @Jason: DONE — and the seam test exists now
**`tsc` 0 · suite 3887 pass · 0 fail · 65 = 65.** **Set: `src/lib/notified-count-seam-task647.mutations.json` — 6 / 6 BITE, baseline 32, CHECKSUM identical.**
- **`return sent.status === "skipped" ? 0 : 1;`** — read from `enqueueLine`'s own result. 🚫 **Never re-derived from the teacher row (`N2` does exactly that and bites).** 📌 **`duplicate` counts as TOLD: the message is already queued for them.**
- ✅ **Value tests on both doors, record AND lift: unlinked ⇒ `0` + a SKIPPED row · linked ⇒ `1` + a QUEUED row.** **The fake answers with the REAL `enqueueLine` rule, so what the service reads is what the outbox would have recorded.**
- ⭐ **§4.4, the test that did not exist:** the SERVER's own answer for an unlinked coach, fed to the three states @Fern's screen reads, produces **NOT-TOLD**.
- ⚠️ **One limit found while writing it — FLAGGED, not fixed:** the teacher's OWN door also answers `teacherNotified: 0`, which her screen renders as *"not told"* when the truth is *"there was nobody to tell"*. **The field cannot distinguish *nothing was sent* from *a send was skipped*.** 🚫 **Changing the shape is her screen and @Sober's call** — pinned as a known limit in the test rather than left to be discovered.
- ⚠️ **`N5` was wrong first:** `1 && await notify(…)` is a no-op, so it **SURVIVED for the wrong reason**. **Re-cut to hard-code the lift's number; it bites.** 🔑 *A mutation that changes nothing is indistinguishable from a gap in the tests.*
- 📌 **`TASK-608`'s `H4` re-anchored** (the notifier now reads the result), with why and when in that set's note.
