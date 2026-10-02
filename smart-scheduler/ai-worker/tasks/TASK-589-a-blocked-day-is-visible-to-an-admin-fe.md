# TASK-589 — a blocked day is VISIBLE to an admin — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · **Size S.** ⏸️ **After TASK-588.**

## §0 Why this exists, stated honestly
**The owner ruled that the classes on a blocked day are "listed for the admin TO HANDLE BY HAND".** 🔑 **That presupposes the admin KNOWS.**
🔴 **Today nobody tells them**, and @Jason has just proven that **nobody ever did** — **I had assumed the old cancel notified admins, and it did not.** 📌 *I was wrong; the requirement stands anyway.*
⇒ **So the admin needs a PLACE to see it.** ✅ **If a place works, a LINE notice may never be needed** — **and a notice is a new feature and the owner's call.** 🔑 **Asking for one before we know whether it is needed is how a system grows noise.**

## §1 What you have
**`GET /teacher-leave-days?from&to`** — **recorded days, each carrying its live classes** (`leaveDayBookings`, reused). **Default today → +60, max 92. Key `menu:calendar` read, no new key. A linked teacher is refused.**

## §2 The work
- **Make a blocked day visible where an admin already looks.** 📌 **The camp banner is the precedent: a strip on the calendar day.** ⚠️ **But derive it rather than copying it — say WHY you put it where you put it.**
- 🔑 **It must carry the two facts that make it actionable: whose day it is, and THAT THERE ARE CLASSES ON IT.** ⚠️ **A marker that only says "blocked" sends an admin looking for the classes; one that says "3 classes" tells them there is work.**
- ⚠️ **A blocked day with NO classes is a different thing** — **decide whether it shows at all, out loud.** 🔑 **Your camp-banner reasoning applies: an empty one may be noise an admin learns to ignore.**
- 🚫 **The marker is not a control.** **Nothing is cancelled or moved from it** — *the owner ruled the admin handles it by hand, in the places that already do that.*
- 📋 **Anything new is a DRAFT into `COPY-REVIEW-2026-09-29.md`, both languages, shape-pinned.**

## §3 The proof
🔑 **Clicked or rendered from the ANSWER: a day with classes shows the count · a day without is whatever you decided, pinned · and a teacher-identity session never sees this at all.**

## §4 Not in scope
🚫 A LINE notice (a proposal with the owner) · 🚫 acting on the classes from the marker · 🚫 Palm's items.

## Definition of Done
- [ ] Visible where an admin already looks, **placement DERIVED and justified** · **whose day + how many classes**, not merely "blocked" · the empty-day case **decided out loud and pinned** · 🚫 not a control · a teacher session sees nothing · drafts filed · 🔑 rendered from the answer, asserted · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch, CHECKSUM · report + `inbox/SA.md` + log.

---

# 📤 REPORT — @Fern → @Sober (2026-09-30)

## §0 ✅ Front repo re-read first
🚫 Not from memory. Tip still `ffa8e9f`. I read the calendar page, both banners, the camp marker's own rule, the leave wire and **@Jason's TASK-587 read** — the route, its key (`menu:calendar`, no new key), `recordedLeaveDays` and that `bookings` is `leaveDayBookings` reused. 🚫 Palm's items 4, 9, 11 untouched.

## §1 The placement — derived, not copied
**A strip above the calendar grid, in BOTH the day and the week view.** Why, in order:
1. 🔑 **The work is on that date, and an admin handles it in this very grid** — moving or cancelling those classes happens in the cells directly below the strip. *A marker one glance from the fix is worth more than a list somewhere else.*
2. **A day-level fact already has a home and a precedent here** (`CampDayBanner`), so this needed no new furniture and no new navigation.
3. ⚖️ **The alternative was the attention panel.** It renders whatever `GET /attention` sends ⇒ it would need **a new BE check** (not ours, and the owner's to ask for) **and it would take the admin away from the place where the fix happens.** *We were told to try a PLACE before asking for a notice; this is the place that costs nothing new.*
4. ⚠️ **Unlike the camp banner, it is mounted in the WEEK view too.** An admin plans a week — **a marker you can only see after navigating into the day is one you find only if you were already looking.** *That is the difference between visible and technically present.*
🚫 **And it is not a control:** no link, no button, no click — pinned by absence.

## §2 The two facts, and the empty day
**Each marker says WHOSE day and HOW MANY classes** — *a marker that only says "blocked" sends an admin hunting; one that says "3 classes" tells them there is work.* **The count is the length of the server's own list**, never derived from the calendar the page happens to hold.
⚖️ **The EMPTY blocked day SHOWS — and this is a deliberate divergence from my camp decision four tasks ago, so here is the reasoning rather than a preference:**
- the camp banner reports **work happening** ⇒ an empty closed week has nothing to report, and showing it is noise an admin learns to ignore;
- this reports **a coach being unavailable** ⇒ 🔑 **the empty case is exactly the one an admin needs BEFORE booking.** *A blocked day with nothing on it is the answer to "can I put a class here?" — and the booking gate will refuse that class anyway, so the marker turns a refusal into something seen first.*
📌 **The two words differ accordingly:** *"{name} is away — 3 classes to handle"* vs *"{name} is away — nothing booked"*. **The divergence is written into `teacher-scope.ts` and pinned, not left in this report.**

## §3 ⚠️ The teacher session never even asks
The route **refuses a linked teacher (403)**. So the read is gated by `enabled: !scoped` — 🚫 **not a caught 403**, because *a catch would still have sent it, and the console would carry a refusal on every calendar render.*
⚠️ **Declared, and it is the pin I most wanted you to see:** this made the calendar's *"the load path is the allowed set exactly"* pin fail, **correctly** — my hook is the first one on that page whose route a scoped session may not call. ✅ **I did not widen the allowed set: the pin now asserts the GATE** (`useLeaveDays(..., !scoped)` at the source), so the property it protects is intact and the new hook is named as admin-only.

## §4 The proof
**8 tests, rendered from the answer:** one marker per recorded day in view · **the count is the server's list length** (3 stays 3; a payload with no `bookings` key reads as none rather than crashing) · nothing outside the dates on screen · no answer at all is not an error · the empty day shows and picks the other sentence · 🚫 no link/button/onClick anywhere in the component · the gate at the source · both mounts present · and the copy names the coach and the count in both languages, **with "cancelled / ยกเลิก" forbidden in both.**
📌 **And one thing I removed rather than added:** my first version re-sorted the rows with `localeCompare`, which put **บี before เอ** and **disagreed with the order the server sent.** 🔑 **The server already answers date-then-coach; a second ordering here is a second opinion about a question that has an answer.** *Filter and shape only — and the test now asserts the server's order.*

## §5 🔑 Break-and-watch — 9 mutations, all BITE
`scripts/mutation/task-589.json` · **BASELINE 22/0, 106 B green** · **CHECKSUM identical.**

| # | mutation | verdict |
|---|---|---|
| V1 | 🔴 the marker stops saying how many classes | ✅ BITES 21/1 |
| V2 | 🔴 the count is derived instead of read | ✅ BITES 20/2 |
| V3 | ⚖️ the empty blocked day is hidden | ✅ BITES 19/3 |
| V4 | 🔴 a teacher-scoped session asks the admin read | ✅ BITES 20/2 |
| V5 | the week view loses the marker | ✅ BITES 21/1 |
| V6 | 🚫 the marker becomes a control | ✅ BITES 21/1 |
| V7 | the marker drops whose day it is | ✅ BITES 21/1 |
| V8 | 🔴 the words say CANCELLED | ✅ BITES 21/1 |
| V9 | the read asks for a range that is not on screen | ✅ BITES 21/1 |
📌 **V3 is there because the empty-day call is a JUDGEMENT** — if you or the owner reverse it, the pin says which line and the report says why it was made.

## §6 Verification
**886 pass / 0 fail across 93 files** (was 879/92 ⇒ **+7 tests, +1 file**) · **tsc clean** · **`bun run build` ok** · mutation pass **CHECKSUM identical**.
🚫 No SQL, no database, no environment · **no BE change and no new key** (the read is on `menu:calendar`) · no deploy request · git read only. 📋 **2 drafts filed as COPY-REVIEW §18**, both languages, shape-pinned.
⚠️ **Declared: one existing pin updated, none weakened** — the calendar's load-path pin: **five hooks now, and the fifth asserted as GATED to admins** rather than added to the allowed set.
⚠️ **Not proven by me:** CSS, focus and a real tap · whether the orange strip is distinguishable from the camp one at a glance (**Tanya's**) · **and whether a marker is enough, or a LINE notice is still wanted — which is the owner's, and this was the cheap half to try first.**

**Ball: @Sober.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30)
Verified by me: **886 pass / 0 fail** across 93 files · tsc 0 · build ok.

## ✅ The placement was DERIVED, including what she rejected and why
**A strip above the calendar grid, in the day AND the week view.** ✅ **Four reasons, and the one I value most is the rejection:** **the attention panel would have needed a NEW backend check — not ours, the owner's to ask for — and it takes the admin AWAY from where the fix happens.**
🔑 **And she diverged from the camp precedent deliberately: the week view too**, because ***"a marker you can only see after navigating into the day is one you find only if you were already looking."*** 🚫 **Not a control — no link, no button, no click, pinned by absence.**

## ⚖️ The empty blocked day SHOWS — **a reasoned divergence from her own camp ruling, and I accept it**
**The camp banner reports WORK HAPPENING, so an empty closed week is noise. This reports A COACH BEING UNAVAILABLE.** ⇒ 🔑 ***"The empty case is exactly the one an admin needs BEFORE booking."*** **It answers "can I put a class here?", and the gate would refuse that class anyway — so the marker turns a refusal into something seen first.**
✅ **And the divergence is written into `teacher-scope.ts` and PINNED (V3), not left in a report.** 🔑 **A divergence that is reasoned and pinned is a decision; one that lives only in a report is an inconsistency waiting for someone to "fix" it.**

## ✅ §3 — the pin failed correctly, and she did not widen anything
**Her new hook made the calendar's "the load path is the allowed set exactly" pin FAIL.** 🚫 **She did NOT widen the allowed set** — ✅ **the pin now asserts the GATE, so the property it protects is intact and the hook is named admin-only.**
🔑 **And the gate is `enabled`, not a caught 403:** ***"a catch would still have sent it, and the console would carry a refusal on every calendar render."*** 📌 **That is the difference between not asking and asking politely.**

## 📌 §4 — what she REMOVED
**Her first version re-sorted with `localeCompare`, which put บี before เอ and DISAGREED with the order the server sent.**
🔑 ***"The server already answers date-then-coach; a second ordering here is a second opinion about a question that has an answer."*** ✅ **Filter and shape only, and the test asserts the SERVER's order.** **Recorded.**

## ⚠️ Her process finding — **mine to fix, and ruled below**
**She and @Jason collided in the copy file twice in one hour: two §17s and two §18s.** ✅ **She renumbered HERS and reordered the file** — 🔑 **but "the next collision is certain, because the number is chosen by whoever writes last."**
⚖️ **Ruled: sections are numbered BY TASK ID from now on — `§T-589`.** 🚫 **Not "one role owns the file"** — *that adds a hop and a queue through me, and I am already the bottleneck.* 🔑 **Numbering by task is collision-free BY CONSTRUCTION, needs no coordination, and is self-documenting: any string traces to the task that made it.** 📌 **Same principle as everything else this fortnight: remove the shared mutable thing rather than schedule access to it.** ✅ **Existing numbers stay; the rule starts now.**
