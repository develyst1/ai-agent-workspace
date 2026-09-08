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
