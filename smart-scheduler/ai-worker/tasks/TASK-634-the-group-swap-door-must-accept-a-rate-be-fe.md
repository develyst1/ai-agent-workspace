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

## ✅ 2026-10-04 — @Jason: BACK half DONE — and the key for @Fern is **`action:bookings.coach-rate`**
**`tsc` 0 · the DB-unreachable suite 3836 pass · 0 fail · 65 .sql = 65 journal tags — no migration.**
**Mutation set: `src/lib/group-swap-rate-door-task634.mutations.json` — 10 / 10 BITE**, baseline 39, CHECKSUM identical. **Test set named in the file.** **All five you listed are in it and bite**, plus three on the half you said you cared about most.

### ▶️ FOR @FERN, BY NAME — the permission key
**`action:bookings.coach-rate`** — *"ดูและแก้ค่าสอน" / "View & edit coach rate"*, **key 59**, the same one the Other-series cover box already uses. 🚫 **No new key.** **The field is hidden without it, never greyed** — and the server refuses a body carrying `rateMinor` without it, so the UI and the door agree by construction rather than by coincidence.

### What changed, back
- **Both doors take an optional `rateMinor`:** `groupSeriesSwap` (`PATCH /group-series/:key/teacher`) and `groupTeacherSwap` (`PATCH /bookings/:id/group-teacher`).
- 🔴 **ONE rule, untouched:** `input.rateMinor ?? seriesRateOf(keyRows, to)`, resolved once, before the transaction, refused when null, **nothing moves on the refusal.** ✅ **`seriesRateOf(` and `RATE_REQUIRED(` are still EXACTLY ONCE each in the act** — the widening added neither.
- **The delegating series door PASSES THE RATE THROUGH** rather than resolving one of its own. **D3 makes it resolve its own and BITES.**
- ✅ **The case you named, as a named test: a group swap to a coach the series has NEVER paid, with a rate supplied, SUCCEEDS and pays that coach** (33000, never the outgoing coach's 50000). **Without a rate it is still refused with nothing written.**
- 🔑 **The given rate WINS over the series' memory** — it is an answer, not a suggestion. **D2 makes memory win and BITES.**
- 🔴 **The supplied rate STILL does not reach the seats.** **G4 still bites (re-ran TASK-632's whole set: 8/8, CHECKSUM identical).** **D4 is its twin on this task and bites.**

### 🔴 The assertion you cared about most — widening the doors did NOT widen who may price a coach
**Proven by value on the gate's own predicate, not reasoned:**
```
bodyEditsCoachRate({ to, fromDate, rateMinor })      → true     bodyEditsCoachRate({ to, fromDate })      → false
bodyEditsCoachRate({ teacherId, fromHereOn, rate… }) → true     bodyEditsCoachRate({ teacherId, … })      → false
bodyEditsCoachRate({ teacherId, fromHereOn, rateMinor: null }) → true   (clearing IS an edit — one predicate, same answer at both doors)
```
⇒ **a swap carrying a rate costs key 59; an ordinary swap still costs nothing.** ✅ **And the gate is CALLED at both doors, BEFORE the service** (pinned by order, because a 403 after the write is a 403 that already happened — **D8**). **D6 and D7 drop each gate and both BITE.**
⚠️ **The contract change is named in the validator where it happens: a body that was a 400 is now accepted, on TWO doors.** **Pinned as unchanged beside it:** `fromHereOn` is still required · the rate is still a non-negative integer · a map is still stripped. **D9 and D10 bite in both directions.**

### ⚠️ Three CENSUSES moved, and that they moved is the proof
**They are derived, so they found my two doors by themselves:**
- **`cover-rate-key-task584`'s writers list** — the two new doors arrived **already carrying `· rateMinor · key59`**. 🔑 **That is the whole proof in one line: a door that takes a rate is gated the moment it takes one, because the guard reads the BODY.**
- **`assertMayEditCoachRate` count 12 ⇒ 14** (in two files), **and `viewerOf(c)` 22 ⇒ 24.** ⚠️ **I wrote into the second that those two counts must move TOGETHER — if they ever do not, one of them is wrong.**
**Each updated with the reason written in, not renumbered.**

---

# 📋 REPORT — FRONT half — @Fern → @Sober (2026-10-04)

**Re-read the front repo first** — `GroupSwapDialog.tsx`, `OtherSeriesDialogs.tsx`'s rate box, the `group-teacher` service call and @Jason's route file. 🚫 **Palm's items untouched; `OtherSeries/*` not opened for TASK-624.**

**tsc exit 0 · suite 960 pass / 0 fail across 105 files · build exit 0.** **Break-and-watch 11 mutations, 11 BITES, CHECKSUM identical.**

## 🔑 The key, BY NAME: **`action:bookings.coach-rate`** (key 59)
**The same one @Jason named, and I used the shared constant rather than a literal** — `COACH_RATE_KEY` in `lib/scheduler/duo.ts` already **is** that string, and it is what the Other-series cover box asks. ⇒ **the two doors cannot drift apart, because there is one spelling of the key in the front end.** 🚫 **No new key.**
✅ **Hidden without it, never greyed** — **R6** greys it instead and bites.

## §3 What the front half is
**One optional `NumberInput` on `GroupSwapDialog`**, built the way the Other-series cover box is built (same `NumberInput` shape, same `bahtToMinor`, same `data-` marker for the pins). 🚫 **No second pattern.**
- 🔴 **Optional, and it cannot stop being optional:** it is **not** `required`, and Save is gated on the teacher alone. **R3 marks it required and bites.**
- 🚫 **Never pre-filled, from anybody.** `value={rateBaht}` is the admin's own input and nothing else. 🔑 *The only rate this screen could reach belongs to the OUTGOING coach — the exact number that was being paid to the wrong person.* **R4 pre-fills it and bites.**
- 🔑 **`rateMinor` rides ONLY when typed** — 🚫 never as `undefined` or `null`. **The server's gate reads the BODY**, so a key that is merely present would cost an ordinary swap a permission it does not need. **R2 sends it on every swap and bites in 4 tests.**
- **Satang on the wire** (`bahtToMinor`): **R7 sends baht and bites** — *that one would have paid a coach one hundredth of the number an admin typed.*

## §3b ⚠️ A mutation I could not have written in advance — and the file it produced
**R8 (dropping `canRate &&` from the BODY builder) SURVIVED the first run**, because a hidden field can never be filled, so the typed value is always empty when the key is absent. ⇒ 🔑 **the guard was real but nothing was asking about it** — the TASK-605 shape again.
**The choice was: delete the guard as dead, or write the case where it is live.** **It is live in exactly one case, and that case is not exotic: the grant is revoked while the dialog is open.** `useCan` reads live data ⇒ the field disappears, **and the number already typed is still in React state.** Without the second check it would ride into a body the server now refuses.
⇒ ⭐ **`group-swap-rate-key-revoked.dom.test.tsx`** drives exactly that: type a rate with the key, revoke it, re-render through an ordinary interaction, submit — **no `rateMinor`, and the swap still goes.** 🔑 *Losing the key costs the rate, not the act.* **R8 now bites.**
📌 **The identity CHANGES in that file, which is why it is its own file** — the transition is the subject of the test, not an accident of ordering (TASK-592's rule, applied rather than quoted).

## §3c 🔴 A near-miss I have to own: I silently rewrote two approved strings
**A one-line fix-up script corrected the ANCHOR of an insertion but not its PAYLOAD** (a `String.replace` hits the first occurrence only), **so the insert replaced `booking.groupSwapNoNotice` — in BOTH languages — with my own invented sentence.**
🔑 **It was caught by `group-session.test.ts`'s own copy pin within the minute** (`expect(...).toContain("No message is sent")`), **not by me reading the diff** — and that is the uncomfortable part, because **nothing in my process would have caught it if that string had not been pinned.**
✅ **Both restored verbatim**, and the suite is green on the original wording. 📌 **The lesson is about the TOOL, as with the test list: a script that edits approved copy should name every string it intends to touch, and I will not use a bulk string-replace on `dictionaries.ts` again.**

## §3d Declared pin updates — three, each with its reason
1. **`group-session.test.ts`** — the swap body gained the optional field. ✅ **What that pin protected is intact and now stronger:** ONE call, and the rate **rides only when typed**; plus the key is asked through the shared constant and the box is never seeded.
2. **`series-scope.test.ts`** — it asserted `GroupSwapDialog` contains **no** `rateMinor`. **That is now false, and the CLAIM it was making is still true**, so it is reworded rather than deleted: 🔑 **there is still exactly ONE door that can show a dead COVER box, and the group swap is still not one of them** — a cover is a ONE-DATE swap (`onDate`), the group door has no such scope, and **its rate box is optional and never blocks the act.** Pinned: no `coverRateRequired`, no `coverBlocked`, and **no `required` on the group box.**
3. **`masked-input-assert.test.ts`** — the in-scope list went from 2 to 4 entries: **the sweep found both new files by itself**, which is what the list is for. Both assert the PATCH body, so neither breaks the rule.

## §6 📋 Copy — ENGLISH DRAFT, for you. 🚫 Nothing ships in my wording
| key | English draft |
|---|---|
| `booking.groupSwapRate` | **{name}'s rate for this group (per session)** |
| `booking.groupSwapRateHint` | Leave this empty unless the swap is refused for a missing rate — that happens when this group has never paid this coach before. |
**Thai drafted beside each** (`ค่าสอนของ {name} สำหรับกลุ่มนี้ (ต่อคาบ)` · `ไม่ต้องกรอก ยกเว้นระบบปฏิเสธเพราะไม่มีค่าสอน — จะเกิดเมื่อกลุ่มนี้ยังไม่เคยจ่ายค่าสอนให้ครูคนนี้`), both marked **📝 DRAFT (Fern, TASK-634)** and **COUNTED** (**R10** makes Thai fall back to English and bites).
🔑 **Two things the wording does on purpose:** the label says **whose** rate and **for what**, because the same coach can cost a different amount on another series (**R9** drops the name and bites); and the hint answers the only question an admin has — *do I have to fill this in?* — **and says when they do**, 🚫 without naming `seriesRateOf` or anything else they cannot see (**R11** drops the *leave empty* half and bites).

## §4 ⚠️ One thing about the mutation SET, and it is the TASK-637 problem again
**I wrote this set in the new `{ tests, mutations }` shape first — then put it back to a bare array**, because the front runner still takes the list on the command line and **`TASK-637` (the port) comes after this task in your order.** **The list is parked beside it as `task-634.json.pending-637`** so the port has it, 🚫 rather than living only in my shell history. ▶️ **TASK-637 next, and it will fold that file in and delete it.**

| # | mutation | verdict |
|---|---|---|
| R1 | 🔴 the typed rate is dropped from the body | **BITES** 36/2 |
| R2 | 🔴 `rateMinor` rides on every swap | **BITES** 34/4 |
| R3 | ⚠️ the field becomes required | **BITES** 36/2 |
| R4 | 🔴 **the defect that started this**: pre-filled from a coach on the row | **BITES** 35/3 |
| R5 | 🔴 shown without key 59 | **BITES** 35/3 |
| R6 | ⚠️ greyed instead of hidden | **BITES** 35/3 |
| R7 | ⚠️ sent in baht, not satang | **BITES** 36/2 |
| R8 | ⚠️ the key check dropped from the body builder | **BITES** 36/2 |
| R9 | the label stops naming whose rate | **BITES** 36/2 |
| R10 | ⚠️ the Thai hint falls back to English | **BITES** 36/2 |
| R11 | the hint stops saying it is optional | **BITES** 37/1 |

## Files
- **Edited:** `Calendar/Modal/GroupSwapDialog.tsx` (the field) · `lib/scheduler/group-session.ts` (`rateMinor?: number`) · `services/scheduler.service.ts` (passed through only when present) · `lib/i18n/dictionaries.ts` (two draft strings; two restored) · `types/api/contract.ts` (the TASK-611 §2b comment reworded in your words).
- **New tests:** `group-swap-rate.dom.test.tsx` · `group-swap-rate-no-key.dom.test.tsx` · `group-swap-rate-key-revoked.dom.test.tsx`.
- **Declared pin updates:** `group-session.test.ts` · `series-scope.test.ts` · `masked-input-assert.test.ts`.
- **Mutations:** `scripts/mutation/task-634.json` (R1–R11) + `task-634.json.pending-637`.
