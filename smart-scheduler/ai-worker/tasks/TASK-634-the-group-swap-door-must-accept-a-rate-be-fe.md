# TASK-634 — BE+FE: **the group-swap door must be able to answer its own refusal** (@Jason's §gap; @Sober ruling)
**From @Sober to @Jason (back) and @Fern (front).** 🔴 **`TASK-632` MUST NOT SHIP WITHOUT THIS. They are one release.**
📌 **@Jason reported the gap rather than papering over it, and left it for me to rule. This is the ruling.**

---

## 1. 🔴 Why this is not an edge case — **I checked, and the blocked case is the NORMAL one**
**`TASK-632` refuses a group swap it cannot rate, which is correct. It rates the incoming coach from `seriesRateOf` over the whole group key.** ⇒ **the coach must already have been paid SOMEWHERE in that series.**
🔴 **I looked for any other source of a coach's rate and there is none.** **`freelance_budgets.rate_minor` is the freelance CEILING's drawdown, not a coaching rate, and nothing reads it here. There is no teacher-level default rate.**
⇒ 🔴 **A coach who is NEW to that group series can never be rated** — **and "a coach new to this series" is exactly what a cover IS.**
⇒ ⚠️ **As it stands, `TASK-632` trades a silent money defect for a HARD BLOCK on the ordinary operation.** **Before it, a group swap to a new coach worked (and paid them wrongly). After it, it cannot be done at all, and the admin has nothing to type.**
🔑 **The refusal is right. A refusal with no answer is not.** ✅ **And the answer already exists on the other path — `TASK-625` §8 shipped exactly this.**

## 2. ▶️ BACK — @Jason
**Let the admin supply the rate, the same way the OTHER-series door already does.**
- **`groupSeriesSwap` (`{ to, fromDate }`) and `swapGroupTeacher` (`{ teacherId, fromHereOn }`) both carry an optional `rateMinor`.**
- 🔴 **ONE rule, unchanged: `input.rateMinor ?? seriesRateOf(keyRows, to)`, resolved ONCE before the transaction, refused when `null`, and NOTHING moves on the refusal.** 🚫 **Do not add a resolution site.** ✅ **`seriesRateOf(` and `RATE_REQUIRED(` stay at exactly once each.**
- ⚠️ **Name the contract change where it happens, as you did for `TASK-625` §8:** **a body that was a 400 is now accepted, on TWO doors.** **And pin what is UNCHANGED: who may send a rate.** 🔴 **`TASK-584`'s key-59 gate reads the BODY, not the scope — prove by value on `bodyEditsCoachRate` that widening these doors did not widen who may price a coach.** 🔑 **That is the assertion I care about most in this task.**
- ⚠️ **The rate still must not reach the SEATS.** ✅ **`G4` already pins that; keep it biting.** 🔑 **An admin supplying a rate for the GROUP must not thereby answer `TASK-633`'s product question about a child's course override.**
- **Mutation set, filed and named:** **the given `rateMinor` ignored · a second resolution site · a rate accepted with no scope · the rate reaching the seats · the refusal moved inside the loop.**

## 3. ▶️ FRONT — @Fern
**The group teacher-swap dialog gains ONE optional field: the incoming coach's rate for this series.**
- ✅ **Show it the way the Other-series cover box already works.** 🚫 **Do not invent a second pattern.** **Read `OtherSeriesDialogs.tsx`'s rate box and follow it.**
- 🔴 **It is OPTIONAL and it must stay optional.** 🔑 **The server fills it from the series' own memory when it can, and most swaps need nothing typed.** 🚫 **Never pre-fill it with another coach's number** — *a pre-filled wrong rate is how this whole defect started.*
- ⚠️ **It is gated on the same grant that already lets a coach's pay be edited.** 🚫 **No new key.** **Hidden without it, never greyed.** **@Jason names the key; use the same one and tell me which, by name.**
- 📋 **If the field needs a label or helper text, draft the English and send it to me.** **Copy is mine this batch.**
- **Done means `tsc` + `bun test` + `build` clean, a DOM test that the field is OPTIONAL (a swap with it empty still submits), that it is ABSENT without the grant, and both languages COUNTED.**

## 4. ✅ Done means, for the pair
**Both halves verified together, with counts.** 🔴 **Neither ships alone, and `TASK-632` waits for this.**
▶️ **And one value test I want by name: a group swap to a coach the series has NEVER paid, with a rate supplied, SUCCEEDS and pays that coach.** 🔑 **That is the case `TASK-632` currently makes impossible, and it is the reason this task exists.**

## 5. 🚫 Not in this task
**`TASK-633`'s product question** (does changing a coach clear a child's course override) · **any repair of existing rows** · **the candidate queries, which are read-only and go to @Porter unrun.**
