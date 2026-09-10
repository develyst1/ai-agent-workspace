# TASK-292 — the client still computes a COUNT on a bulk act, and a NAME from an arbitrary row

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-08)
**Source:** **your** answer to TASK-291's Question. 📌 **No clock. Blocks nothing.** 🚫 No backend change —
both figures are already on responses we receive.

---

## §1 🔴 `pendingCount` — the same defect as TASK-291, already shipped and already worked around
`PlanModal:247` → `t("plan.confirmCourse", { n: pendingCount })`, a **client** count on the button of a **bulk
act**.
🔑 **Your sentence is the whole task:**
> *"The `skips` panel exists precisely because the server confirms fewer than the button offered ⇒ the divergence
> is already KNOWN and is handled AFTER the act instead of before it."*

⇒ **We have known for some time that the number on that button can be wrong, and we built a panel to explain the
gap afterwards instead of removing it.** 📌 **TASK-291 was the same shape and we chose "ask the server" over
"explain the difference later".** **Same choice here.**
⚠️ **`confirmCourse` may have no preview.** **Check before designing:** if there is one, this is TASK-291 again;
**if there is not, STOP and tell me** — a new endpoint is a decision, not a fix, and the `skips` panel means
today's behaviour is at least honest after the fact.
🚫 **Do not delete the `skips` panel either way.** A server that confirms fewer than expected is still possible
for reasons a preview cannot see (a budget failure between preview and act). **The panel stops being the only
defence; it does not stop being needed.**

## §2 🔴 `program` — an arbitrary row's subject, in the sentence you just fixed
`PlanModal:567` — `plan.sessions[0]?.subject?.name`.
🔑 **Your own finding, and it is not theoretical:** *"`sessions[0]` is an ARBITRARY row: a soft-linked
`SINGLE_SESSION` extra sorts into the plan and carries its own subject — exactly the case `courseSlot` excludes
for the resume default, one line below."*
⇒ **The pause dialog can name the wrong programme, in the same sentence whose number we just made true.**
✅ **The preview response already carries `program` and `student`** — so this costs a read, not a request.
⚠️ **`student` (`:568`) is the same shape and lower risk** (one student per plan). **Do it in the same pass and
say so**, rather than leaving a sibling behind.

## §3 ⚪ Named, deliberately NOT in scope
**`PlanModal:198`** — `plan.liveEndDate ?? liveSessions[last].date`, **an OR-fallback that computes an end date
when the server did not send one.** **Create mode only, where every row is live by construction.**
📌 **Same silent-substitute shape**, and I am leaving it: **in create mode there is no server answer to prefer**,
so the fallback is doing real work rather than second-guessing. ⚠️ **If your §1 read shows it firing outside
create mode, that changes and I want to know.**

## §4 What must not change
- 🚫 The pause count (TASK-291) — **it is the server's now and stays.**
- 🚫 `visiblePlanRows`, `courseSlot`, the resume defaults, the re-plan.
- 🚫 The pinned two-file live-status sweep — 🔑 **and do not let this task add a third.**
- 🚫 No backend change without stopping first (§1).

## Definition of Done
- [ ] Typecheck clean; **state the command**
- [ ] **§1 answered first:** does `confirmCourse` have a preview? **If not, STOPPED and reported — not built.**
- [ ] If it does: **the button's number is the server's**, asserted, and **`skips` still renders** — asserted
- [ ] `program` and `student` come **from the preview response** — asserted, **and asserted that `sessions[0]`
      no longer feeds either**
- [ ] 🔑 **The live-status sweep still names exactly TWO files** — asserted, unchanged
- [ ] 🚫 No backend change · the pause count, `courseSlot` and the resume defaults untouched

## Question
**Is there a third surface with a client-computed number on an act?** You have now swept this component twice.
📌 *The two you found were both in dialogs that ACT — a pause and a bulk confirm — and both were the number the
admin agrees to.* **That may be the shape rather than the coincidence: a figure beside a button is the one worth
auditing.** **Name any others; build none.**

---

## §5 ✅ §2 DONE · 🛑 §1 STOPPED as instructed — **but the reason to stop is not the one in the task**

```
bunx tsc --noEmit → exit 0
bun test          →  238 pass / 0 fail   (+4)
bun run build     → ok
```
🚫 No backend change.

### §1 🛑 STOPPED — **there is no `confirm/preview`.** ⚠️ **And the count is wrong for a reason that needs none.**
✅ **Answered first, at source:** the only confirm routes are `POST /courses/:id/confirm` (`api.ts:110`) and
`POST /bookings/bulk-confirm` (`:235`). **No preview exists.** ⇒ **not built, per your instruction.**

🔴 **But the premise underneath §1 does not hold, and the real divergence is cheaper than an endpoint.**
You wrote *"the number on that button can be wrong … and we built a panel to explain the gap afterwards"*.
**Both halves of that need correcting:**

| | |
|---|---|
| **the client counts** | `sessions.filter(s => s.status === "PENDING")` over the PLAN DTO — and `loadSessions` selects `WHERE courseId = id` with **NO `bookingType` filter**, so **soft-linked `SINGLE_SESSION` extras are in it** |
| **the server confirms** | `loadCourseForEnd` → `WHERE courseId = id AND bookingType = 'COURSE_PACKAGE'`, then `status === "PENDING"` |

⇒ 🔴 **A PENDING soft-linked extra is COUNTED by the button and never touched by the act.** **The status
predicate is identical on both sides; the SET is not** — exactly TASK-291's shape, on `bookingType` instead of
status.

🔻 **And the `skips` panel cannot explain this one.** A skipped row is one the server *tried*; an extra is one
it never loaded, so it produces no `result`. ⇒ the admin sees **`Confirm whole course (4)` → `Confirmed 3
sessions`, `skips` empty, and no line anywhere saying why.** **The panel is not a workaround for this gap — it
is blind to it.**

✅ **This needs no endpoint and no backend change:** `bookingType` is already on every `PlanSession` and already
used one line away (`courseSlot`). 🚫 **I did not do it** — the DoD says *stopped and reported, not built*, and
this is now a different fix from the one §1 scoped. **Yours to re-cut.**
⚠️ **What a preview still could not promise:** which sessions SUCCEED. A budget failure happens at write time,
so `skips` stays necessary either way — **your §1 instinct to keep it is right for a reason the task did not
give.**

### §2 ✅ Done — `program` only, and **two corrections**
`program={courseSlot?.subject?.name ?? null}` — was `plan.sessions[0]?.subject?.name`.
🔑 **`courseSlot` is already *"the first row that is not an extra"* (TASK-288), which is EXACTLY the set the
server names from**: `previewCourseEnd` returns `rows[0]?.subject?.name` over `loadCourseForEnd`'s rows, and
those are `COURSE_PACKAGE`-only. **Same row, same answer, and no second predicate introduced.**

🔻 **Correction 1 — I did NOT take it from the preview, and taking it would have fixed half a dialog.**
The preview's `program` **is itself `rows[0].subject`** — *not privileged knowledge, just row zero of the right
set* — and it exists **only on the drop face**. The resume face has no preview, so routing through it would
leave *"{program} for {student} is re-planned…"* still able to name an extra. ⇒ one source, both faces.
🔻 **Correction 2 — `student` was NEVER `sessions[0]`.** `:558` already reads `plan?.student?.nickname ||
plan?.student?.name`, the plan's own. The task called it *"the same shape"*; **it is not, and it needed no
change.** ✅ Asserted, so nobody "fixes" it later.

### §3 ✅ Checked — **it does NOT fire outside create mode**
`createPreviewLine` is rendered under `{isCourse && isCreate && (…)}` (`:335`) and nowhere else. *(The string
is **built** on every render at `:197`, so the `??` fallback evaluates in edit mode too — but it is never
displayed there, so nothing a user can see depends on it.)* ⇒ **your reasoning for leaving it stands.**

### Definition of Done
- [x] `bunx tsc --noEmit` exit 0 · `bun test` **238 / 0** · build ok
- [x] **§1 answered FIRST: no preview → STOPPED and reported, not built** — with the divergence it actually has
- [ ] *(the button's number — not done, and now a different fix from the one §1 scoped)*
- [x] `program` no longer reads `sessions[0]` — asserted; **`student` never did, asserted too**
- [x] 🔑 **The live-status sweep still names exactly TWO files** — unchanged, and `bookingType !==
      "SINGLE_SESSION"` is a TYPE predicate, so it cannot become a third `COURSE_LIVE`
- [x] 🚫 No backend change · the pause count, `courseSlot` and the resume defaults untouched
- [x] Break-and-watch — mutation and restore in one call, **restore proven byte-identical by `md5sum`**

📌 **One assertion of mine failed correctly and I kept the reason:** I first banned the string `"CONFIRMED"` in
`PlanModal` — **but `PlanModal` is one of the two files the pinned sweep deliberately names.** A ban would have
forbidden what the sweep allows. **The right assertion was the one that already existed.**

## Question — **is there a third surface with a client-computed number on an act?**

✅ **Yes — `BookingsTable`'s bulk confirm — and it is SAFE, which is the useful part.**
`t("bookings.bulkConfirmSelected", { n: selected.length })`, on the button (`:290`) and in the confirm dialog
(`:149`). 🔑 **But `bulkConfirm` POSTs `{ ids }` — the client SENDS the set.** ⇒ **the server acts on exactly
the rows the number counted; it cannot diverge.**

⇒ 🔑 **So the shape is not *"a figure beside a button"*. It is *"a figure describing a set the SERVER
chooses."***
| | who picks the set | |
|---|---|---|
| `dropLine` (TASK-291) | server (`endableSessions`) | 🔴 diverged — fixed |
| `confirmCourse` (§1) | server (`COURSE_PACKAGE` + `PENDING`) | 🔴 diverges — open |
| `bulkConfirmSelected` | **client, and sends it** | ✅ cannot diverge |

📌 **That is testable in one question — *does the request carry the set, or only an id?*** — where *"is there a
number near a button"* is not. ⚠️ **And it predicts the next one**: any future `POST /x/:id/<verb>` whose
screen states a count is a candidate; any `POST /x/<verb> { ids }` is not.
✅ **Also checked, not in class:** `importBalance.savedCount` (a post-act count of what the client itself did),
`endCourse.resumeCreated` (the server's response), `voucher.usedN` / `leftN` (server fields).
🚫 **Named, none built.**
