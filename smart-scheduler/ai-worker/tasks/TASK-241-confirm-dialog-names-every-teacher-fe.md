# TASK-241: FE — DEF-6: the confirm dialog must name EVERY assigned teacher (the send already does)

- Source: REQ-078 **DEF-6** (Tanya) · the owner's Q11 ruling *"ส่งไลน์หาครูทุกคน แก้กล่องยืนยันด้วย"* (via @Porter)
- Status: ✅ DONE — code (Sober 2026-09-02) · local rendered check + Q1/Q2 → @Porter. Was: **REVIEW** (Fern 2026-09-01) — dialog fixed; the chip finding is written up below (**not** changed,
  per the task). Rendered check = local. _Was: TODO — 🔴 release-blocking (REQ-078 is `TEST_FAILED`)._
- Depends on: none. Repo: **smart-scheduler-front**, on `develop`. Assignee: **@Fern**

## 🔴 First — the send is NOT broken. This is display-only, and it needs no BE change.

@Porter asked whether the send fans out or is primary-only. **Answered from the source, so nobody needs the
outbox rows or a second phone:**

- `assignedTeacherIds()` (`scheduler.service.ts:1017`) returns **primary first, then the extras**, deduped.
- The confirm path calls it (`:2457`) and **loops**, enqueuing one outbox row per teacher (`:2473-2483`).
- `notification` is assigned **only** for the primary (`:2486`), with the reason in the comment beside it: the
  FE's *"ส่ง LINE แล้ว / ยังไม่ผูก LINE"* chip has always described the booking's own teacher, and TASK-228
  deliberately did not change what it means.

⇒ **What Tanya saw — one `notification` object for a two-teacher booking — is the response shape, not the send.
Dewy's row exists.** The defect is that the screen under-reports.

## What to do

**1. The dialog must name every assigned teacher.**
> *"จะส่งตารางสอนทางไลน์ถึง ครูBank, ครูDewy"*

**No BE change is needed:** `booking.teachers` is already on the DTO (TASK-224) and TASK-227 already renders it in
the cell. Use the same array — 🚫 **do not re-derive the list from anything else**; one accessor, as everywhere
else in this feature.
🔴 **The sentence an admin decides on must not under-report.** Confirming is the moment they choose to message
people; a dialog naming one of two teachers is asking them to approve something other than what happens.

**2. ⚠️ The post-confirm chip has the same shape of problem — check it and say what you find.**
The chip reads the single `notification`, i.e. **the primary teacher only**. With two teachers, one linked and one
not, it can say *"ส่ง LINE แล้ว"* while the second teacher's row is `SKIPPED`. **That is not in @Porter's DEF-6
wording** and I am not widening the task on my own: **report what the chip does today** in your notes, and
whether it can be made honest from data the FE already has. If it needs the BE to return per-recipient results,
that is a separate task and a separate ruling — name it, do not build it.

## Definition of Done — the OUTCOME
- [ ] Confirming a **multi-teacher** อื่นๆ booking shows a dialog naming **every** assigned teacher, in the same
      order the BE sends (primary first).
- [ ] A **single-teacher** booking's dialog is **byte-identical to today** — all four existing types included.
- [ ] The names come from `booking.teachers`; `grep` the diff — no second source.
- [ ] Both languages, and the **rendered** dialog checked, not the dictionary key.
- [ ] Your finding on the post-confirm chip is written in the notes (behaviour today + whether the FE can fix it
      alone). **No chip change in this task.**
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun run build` ok · suite green (report the count).

## Implementation Notes (Fern, 2026-09-01)

**Repo:** `smart-scheduler-front`, `H:\scheduler\smart-scheduler-front`. `git rev-parse HEAD` = **`bda6511`**
(TASK-237's fix is in the same uncommitted tree).

### The change — two files, and the single-teacher path is untouched by construction

**`BookingModal.tsx` → `handleConfirm`.** The message is now chosen by the teacher count:

```tsx
const assigned = booking.teachers ?? [];
const message =
  assigned.length > 1
    ? t("confirmAction.confirmMsgMulti", { n: assigned.length, teachers: assigned.map(…).join(", ") })
    : t("confirmAction.confirmMsg", { teacher: teacherName });
```

🔴 **The single-teacher branch is the *same key and the same argument* as before**, so "byte-identical for the
four existing types" is true by construction rather than by testing. I deliberately did **not** switch it to
`booking.teachers[0].name`: `teacherName` resolves through the loaded roster and falls back to `"-"` when the
teacher is not in it (archived, or not bookable that day). Reading the DTO instead would arguably be *better* —
but it would be a **different string in that edge case**, and this task asked for byte-identical.

**Names come only from `booking.teachers`.** `grep` of the diff for a name source: the sole hit is
`assigned.map((tc) => tc.nickname || tc.name)`. No second source, no re-derivation from the roster or from
`teacherId`.

`nickname || name` matches how every other surface names a teacher (the calendar columns, and the teacher tile
I built in TASK-227) — and it is what the owner's own wording shows (*"ครูBank, ครูDewy"*).

### One addition to the wording, declared rather than slipped in

`confirmMsgMulti` carries a **count** as well as the names:
- **TH** `ระบบจะส่งตารางให้ครู {n} คน ทาง LINE: {teachers}`
- **EN** `The schedule will be sent on LINE to {n} teachers: {teachers}`

📌 **Why I added it:** with names alone, *a list that silently lost one reads exactly like a correct list* — which
is this defect's own failure mode, arriving a second time. The count is the cheapest thing that makes a truncated
list visible to the person approving it. It is **not** in @Porter's DEF-6 wording, so it is his to strip; the
sentence works without it.

### ⚠️ The post-confirm chip — what it does TODAY (reported, not changed)

**Today it describes the primary teacher only, and it can therefore be wrong for a multi-teacher booking.**

Traced at the source, both sides:
- **BE** (`scheduler.service.ts:2473-2486`): the loop enqueues one outbox row per teacher, then
  `if (t.id === current.teacherId) notification = res;` — **`notification` is assigned only for the primary**,
  with the reason in the comment beside it (the chip has always meant the booking's own teacher).
- **FE contract** (`types/api/contract.ts:411`): `notification: { channel; status: "queued" | "skipped";
  reason? } | null` — **one object, no recipient identity, no array.**
- **FE** (`BookingModal.tsx` `handleConfirm`): renders `"ส่ง LINE แล้ว"` / `"ยังไม่ผูก LINE"` straight off it.

⇒ **Two teachers, primary linked and the second not: the chip says *"ส่ง LINE แล้ว"* while the second teacher's
row is `SKIPPED`.** The send is correct; the report is not. Exactly the shape of DEF-6, one screen later.

**Can the FE fix it alone? No — not honestly.**
The response carries no per-recipient result, so the FE cannot know the second teacher's outcome. What it
*could* do without any BE change is stop over-claiming — narrow the sentence to what the data actually supports
(e.g. *"ส่ง LINE ให้ครูคนแรกแล้ว"*, or drop the per-send claim for multi-teacher bookings and say the messages
were queued). That is honest but **less** useful than today's chip, and it is a wording decision, not mine.

**Making it genuinely right needs the BE to return per-recipient results** — an array of
`{ teacherId, status, reason }` instead of the single `notification` — which is a contract change touching every
caller of `updateBookingStatus`. 🔴 **Naming it, not building it**, per this task. See Q1.

### Verified

- `bunx tsc --noEmit` → **exit 0**.
- `bun test` → **82 pass / 0 fail**, 166 expect() calls, 10 files (unchanged — this task adds no logic; the two
  new dictionary keys are covered by `keys.test.ts`, which resolves every literal `t("…")` in **both** languages
  and would fail on a missing Thai entry).
- `bun run build` → ok, all routes emitted.

### 🔴 Not done: the rendered dialog

Auth wall again (no password from me; no QA-session route). **Route it LOCAL, like TASK-147/226 — not to `sid`:**
the mock has a three-teacher อื่นๆ booking (`b13`, from TASK-227) and mock auth accepts any credentials, so the
multi-teacher dialog is reachable offline in a minute.

```bash
NEXT_PUBLIC_USE_MOCK=true NEXT_PUBLIC_API_URL="http://127.0.0.1:9/api" AUTH_URL="http://localhost:3017" PORT=3017 bun run dev
```

Open `b13` → **Confirm + LINE**. The dialog must name **all three**, primary first. Then open any 1HR/trial
booking and confirm its dialog is **unchanged**. Both languages — check the **rendered** dialog, not the key
(TASK-210's lesson).

## Questions

**Q1 — the chip needs a ruling, and it is a different one from DEF-6.**
Per §2 I have reported and not widened. To decide it you need both halves in one place: the FE **cannot** be
made accurate alone (no per-recipient data on the wire), and it **can** be made merely honest by under-claiming,
which is worse for staff than today's chip in the common single-teacher case. So the real options are (a) leave
it and accept that the chip means *the primary teacher*, documented; or (b) a BE task returning per-recipient
results, which changes `UpdateBookingStatusResponse` for every caller. 📌 **My lean is (b), but only if the owner
wants the screen to answer "did everyone get it?"** — and that is a business question, not mine. Worth putting
to @Porter alongside DEF-6 rather than after it, since he is already holding the owner's Q11 ruling.

**Q2 — the count in the wording (see above).** Mine, not @Porter's. Keep or strip; one line either way. I would
rather it be an explicit call than a thing that quietly appeared in a customer-facing sentence.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-02: ✅ **PASS.** The edge case you refused to "improve" is the best call in this task.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **82 pass / 0 fail** · `build` ok ·
`confirmMsgMulti` at `BookingModal.tsx:210` and in **both** dictionaries (`:60` en / `:1095` th).

📌 **Not switching the single-teacher branch to `booking.teachers[0].name` is the judgement I want on the
record.** It would have read *better* — one source everywhere — and it would have changed the rendered string in
the case where the teacher is archived or not bookable that day, because `teacherName` falls back through the
loaded roster. **The task said byte-identical; you noticed that "obviously equivalent" was not equivalent, and
said so instead of quietly upgrading it.** That is the same class as the `?.value` refusal on TASK-237: the
tempting version is indistinguishable from the correct one until it is wrong in front of someone.

Keeping the **same key and the same argument** on that branch makes *"unchanged for the four existing types"*
true by construction rather than by testing — which is the only kind of unchanged worth claiming during a
`TEST_FAILED` round.

### ✅ Q2 — the count. Keep it, and I am backing it to @Porter rather than leaving it as yours

> *"With names alone, a list that silently lost one reads exactly like a correct list."*

**That is this defect's own failure mode arriving a second time**, and the count is the cheapest thing that makes
a truncated list visible to the person approving it. **This is the same reasoning Jason used for the per-teacher
dry-run output on `link-all` — a summary that cannot be wrong-looking is a summary nobody checks.**
It is @Porter's wording to strip; **my recommendation to him is keep**, and declaring it rather than slipping it
into a staff-facing sentence is exactly right.

### ✅ Q1 — the chip. Your reporting is complete, and the conclusion is not a preference

You traced both sides and the finding is structural, not stylistic: `UpdateBookingStatusResponse.notification` is
**one object with no recipient identity** (`contract.ts:411`), and the BE assigns it only for the primary
(`scheduler.service.ts:2486`). ⇒ **the FE cannot be made accurate alone**, and the honest-but-under-claiming
option is *worse* for staff in the common single-teacher case. **Those are the real options, and you laid them
out instead of choosing between them.**

**My position for @Porter, so he has one recommendation rather than two halves:** (b) — per-recipient results —
**but not now, and not as part of REQ-078.** It changes `UpdateBookingStatusResponse` for every caller of
`updateBookingStatus`, and the owner has ordered this the **last** round. ⇒ it goes up as a **named follow-up**
with the question that decides it: *does the owner want the screen to answer "did everyone get it?"* If yes it is
a small BE contract task; if no, option (a) stands and **the chip's meaning gets documented rather than left to
be rediscovered.** 🔴 Either way it must not be silently left as "looks fine" — a chip that says *ส่ง LINE แล้ว*
while a teacher's row is `SKIPPED` is a false statement on screen, even if a rare one.

### The rendered check — LOCAL, and your routing is right
Same as TASK-147/226: the mock has `b13` (three teachers) and mock auth takes any credentials, so this is
reachable offline in a minute and must **not** consume @Tanya's `sid` round. Command and the walkthrough are in
your notes and go to her as-is.

**Status → DONE (code).** 🏁 **This is the last build item on REQ-078.**
