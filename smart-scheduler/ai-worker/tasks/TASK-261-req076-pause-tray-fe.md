# TASK-261 — REQ-076 FE: the `รายการที่พักไว้` tray, and the pause / resume controls

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-06)
**Status:** ✅ **DONE — code** (Sober 09-06, reviewed) — tsc 0 · 99/0 · ⏳ the deployed measurement is OWED and moves to the batch check. ⛔ Ships with TASK-260.
**Spec:** `SPEC-075` §4 · **Requirement:** `REQ-076` AC-9…AC-14.
🔴 **`uat` batch #3, and it ships WITH the backend or REQ-076 does not ship** — @Porter's call under the board's
DEPLOY RULE 3 (*never ship a server-side gate without the screen that opens it*).
📌 **Why that is not ceremony:** a paused booking **leaves the calendar by design** (AC-1) and **the tray is the
only place it exists** (AC-9). **Backend alone would ship a disappearance** — an admin pauses a booking and cannot
find it again.

⛔ **Depends on TASK-260** for the endpoints. **Build against the contract, not against a running server** — the
BE task and this one are being written in parallel on purpose.

---

## §1 The tray (AC-9…AC-12)

- **AC-9 — on the calendar page, visible without navigating away and without opening anything.** The owner's own
  test: *an admin doing ordinary booking work **notices** it.* His words — *"แทบช่องเก็บ ที่เตะตาแอดมิน"*.
- 🔴 **AC-10 — it is NOT a calendar cell and never renders inside the grid.** A paused booking has no scheduled
  slot; **anything dateless placed in a dated grid is invisible or wrong.** ⚠️ **This is REQ-078's DEF-4 stated in
  advance** — there, an item the calendar could not render became a double-booking nobody could see. **The tray
  sits BESIDE the grid.**
- **AC-11 — an empty tray reads as deliberately empty** (`ไม่มีรายการที่พักไว้`), **not missing.** 📌 A control
  that vanishes when it is empty teaches staff it is not there, and then they stop looking for it.
- **AC-12 — each row names student · booking type · the ORIGINAL date & time**, so two paused bookings can be told
  apart **without opening either.**

## §2 The controls
- **Pause** — offered only for `1HR` · `VOUCHER` · `FIRST_TRIAL` that are **not yet attended**.
  🚫 **AC-2:** never on an `ATTENDED` booking. 🚫 **AC-3:** never on a **course** booking — REQ-071 owns that and
  **its wording must not change.**
  🚫 **AC-8: no reason field, no reason picker.** REQ-009's list must not appear here — **offering it would teach
  staff that pause and cancel are the same act**, and they are not.
- **Resume** (`นำกลับมาลงตาราง`) — **any** date and time, not only the original (*"ตอนไหนก็ได้"*).
  ⚠️ **AC-14: on a clash, show the BACKEND's refusal message.** It names the teacher and the clashing booking.
  🚫 **Do not compose a second clash message** — one clash rule in the product, and the copy is already written.

## §3 Copy — @Porter's, verbatim
| Where | Thai |
|---|---|
| The action | **พัก** *(never "ระงับ", never "Hold" — it is the customer's own word)* |
| The tray | **รายการที่พักไว้** |
| Empty | **ไม่มีรายการที่พักไว้** |
| Resume | **นำกลับมาลงตาราง** |

## §4 The board's standing FE rule applies
**Layout IS verifiable.** The tray sits next to a dense calendar grid — **measure it in the deployed app at
1280**, not in a component sandbox. ⚠️ **AC-9 is a claim about what an admin notices while working**, and that
cannot be judged from a storybook page.

## Definition of Done
- [ ] Typecheck + lint clean; state the commands
- [ ] The tray renders on the calendar page, **outside the grid** — and there is a test or a screenshot proving it
      is not a cell
- [ ] Empty state renders `ไม่มีรายการที่พักไว้` and **is present when empty** — asserted
- [ ] A row shows student · type · original date/time
- [ ] Pause is offered for exactly the three types, hidden for `ATTENDED` and for course bookings — asserted
- [ ] **No reason field anywhere in the pause flow** — asserted as an absence, **with the reason in the test name**
- [ ] Resume accepts any date/time and surfaces the backend's clash message unchanged
- [ ] Measured at **1280 in the deployed app**, per the board's standing rule — say where you measured

## Questions
1. **Where exactly on the calendar page does it sit** without pushing the grid below the fold at 1280? **That is
   the AC-9 judgement and it is yours** — I am not choosing a corner from a spec file.
2. **What does the tray do on a phone / narrow screen?** The REQ does not say. **If it collapses to a count, say
   so** — a tray that silently disappears at a breakpoint fails AC-9 for whoever is on a laptop that day.

---

## Implementation Notes (Fern, 2026-09-06)

| | |
|---|---|
| Repo | `smart-scheduler-front` → the `machine.local.md` row |
| `git rev-parse --short HEAD` | `3b646ba` · `HEAD` is **1 ahead of** `develop`, 0 behind — checked, not assumed |
| Status | **REVIEW** — code complete. ⚠️ **Not measured in the deployed app** (see §Not done). Q1/Q2 answered below; **one new question, Q3, is the one that matters for the batch.** |

### 🔴 Q3 FIRST — the contract does not exist, and both halves are being built against it

TASK-260 names no routes and `SPEC-075` names none either; `smart-scheduler-back` @ `26e495e` has no booking
`PAUSED` anywhere (only REQ-071's *course* pause). So *"build against the contract"* had no contract to build
against. **I did not guess quietly** — I took the shapes this repo already uses for the course pause/resume
that REQ-071 owns, because a second convention for the same verb is how two halves that must ship together
stop fitting:

| | Assumed | Precedent |
|---|---|---|
| พัก | `POST /bookings/:id/pause` — **no body** | `POST /courses/:id/pause` |
| นำกลับมาลงตาราง | `POST /bookings/:id/resume` `{ date, startTime }` | `POST /courses/:id/resume` |
| The tray's list | `GET /bookings?status=PAUSED` — **existing endpoint, existing filter** | no new route needed |

📌 **The no-body pause is worth keeping whatever else changes:** with no field to put one in, **AC-8's reason
cannot be sent even by accident.** The absence becomes structural instead of a promise.
⚠️ **All three live in `scheduler.service.ts` and nowhere else**, so if @Jason lands different paths it is one
file. **@Sober — please reconcile this with TASK-260 before either half is called done**; under DEPLOY RULE 3
they ship together, and two halves built against different shapes cannot.

### Q1 — where it sits. **The arithmetic changed my answer, so I am showing the arithmetic.**

I started with a right-hand rail from `xl` (1280) and then computed it, because §4 makes 1280 the number this
is judged at. Real widths from the shell (`AdminLayout`: `w-64` sidebar, `main` `sm:p-6`) and from the grid
(`160px + 7 × minmax(150px)`):

| @1280, sidebar expanded | px |
|---|---|
| main content area | **976** |
| week grid's own minimum | **1210** ⇒ *already* scrolling horizontally, before this task |
| grid width **with** a 17rem rail + 20px gap | **684** — about **3.5** day columns where there were 5.4 |
| the same rail at **1536** | **940** |

⇒ **The rail is `2xl` (1536) and up. At 1280 the tray is a horizontal strip above the grid.** Taking 292px from
an already-overflowing 976px at the exact width AC-9 is judged at is too much of the schedule to spend, and
*"it is beside the grid"* is not worth a third of the week. 📌 **I would have shipped the rail at 1280 if I had
not done the sums** — that is what §4's rule is for.

### Q2 — narrow screens: **a strip, never a count, never a disappearance**

Below `2xl` (so at 1280, 768 and 375) the tray is a horizontal band above the grid, each row still carrying all
three AC-12 fields, scrolling sideways when there are many. 🚫 **Not a count:** a count fails AC-12, which asks
for rows that can be told apart *without opening either*. 🚫 **Not hidden:** a tray that vanishes at a
breakpoint fails AC-9 for whoever is on a laptop that day. It costs one card of height and the grid keeps its
full width.

### What changed

| File | Change |
|---|---|
| `types/api/contract.ts` · `types/app/scheduler/index.ts` | `PAUSED` on the status union · `BOOKING_STATUS_COLOR` · **new** `OFF_CALENDAR_STATUSES` |
| `components/common/BookingBadges.tsx` | `PAUSED` → `PauseCircle` in `STATUS_ICON` |
| `lib/scheduler/pause-booking.ts` **(new)** | `canPauseBooking` · `canResumeBooking` · `canSubmitResume` · `PAUSABLE_BOOKING_TYPES` |
| `components/partials/Calendar/PausedTray.tsx` **(new)** | the tray, both layouts |
| `CalendarContent.tsx` | mounts it **beside** the grid (rail) / **above** it (strip) |
| `CalendarGrid.tsx` · `CalendarWeekGrid.tsx` | both now filter on the ONE `OFF_CALENDAR_STATUSES` literal |
| `Modal/BookingModal.tsx` | พัก menu item + confirm · นำกลับมาลงตาราง dialog |
| `services/scheduler.service.ts` · `scheduler.mock.service.ts` · `hooks/scheduler/useScheduler.ts` | the three calls, offline too |
| `lib/i18n/dictionaries.ts` | 15 keys × 2 languages |

**The rules are pure functions, not JSX conditions** — the lesson TASK-147 and TASK-237 both landed on: a rule
that only lives in an `&&` cannot be tested, and AC-1/2/3/13 are what this requirement is *made of*.

### 🔴 AC-10, and why I did more than render outside the grid

Rendering the tray outside the grid is only half of *"never a calendar cell"*. **A paused booking keeps its
`date`/`startTime`** (TASK-260 §1 — they are the slot it came from, which AC-12 needs), so it is perfectly
renderable and **would quietly draw itself back into the grid it is supposed to have left.** Both grids
previously filtered `b.status !== "CANCELLED"` as **two separate literals**; they now read one
`OFF_CALENDAR_STATUSES`, and a test asserts the old literal is gone from both — TASK-239's lesson applied on
this side, because two copies of *"which statuses are off the calendar"* is exactly how the day view and the
week view come to disagree.
⚠️ **This is not a substitute for the backend excluding it** — the calendar payload filters only `CANCELLED`
today, so **if TASK-260 does not exclude `PAUSED` there, the FE guard is the only thing stopping DEF-4
recurring.** Worth a line in @Jason's review. See Q4.

### Verified

```
bunx tsc --noEmit   → exit 0
bun test            → 99 pass / 0 fail, 208 expect(), 11 files   (was 82/0 across 10 → +17)
bun run build       → ok, all routes emitted incl. ○ /scheduler/calendar
```
⚠️ **`bun run lint` FAILS, and not because of this change:** the script is `next lint`, which **Next 16 removed**
(this repo is on 16.2.9). `package.json` has not been touched since `4920f86`. **Pre-existing and repo-wide** —
naming it rather than fixing it inside a REQ-076 task; it is a one-line script change whenever someone wants it.

**The 17 new assertions, each named by its AC** (`lib/scheduler/pause-booking.test.ts`):
AC-1 (exactly three types) · **AC-3** (course refused in every status, and absent from the list) · **AC-2**
(ATTENDED, NO_SHOW, CANCELLED, and already-paused) · AC-13 (any date/time; submit blocked until both chosen) ·
**AC-10** (`PAUSED` is off-calendar, and both grids read the one literal) · **AC-8 — asserted as an absence at
both places a reason could get in**, the call and the screen, under the test name *"offering a reason here would
teach staff that พัก and ยกเลิก are the same act"* · **AC-11** (the empty line renders and is not an early
`return null`; the tray is mounted unconditionally, not behind a non-empty check) · and @Porter's four Thai
strings verbatim, plus an assertion that this action never says **ระงับ** — a test rather than a comment,
because a later editor "improving" the wording is exactly how a customer's own word gets replaced by ours.

### 🔴 Not done — the §4 measurement, and I am not dressing it up

**I did not measure in the deployed app.** `/scheduler/*` is behind the auth proxy and the only way through is a
password field I may not fill; that is unchanged from TASK-222/226/227/241/243. **The numbers above are computed
from the shell's and the grid's own CSS — they are arithmetic, not a measurement**, and §4 is explicit that
AC-9 is a claim about what an admin *notices while working*, which no amount of arithmetic settles.

**@Sober — this one genuinely needs the deployed app, so it belongs with @Tanya in the batch check, not as a
local run.** What to look at, in order:
1. **1280, sidebar expanded** — the strip is under the header, the grid below it is unchanged in width, and the
   first schedule rows are still on screen. **That is the AC-9 judgement.**
2. **1536+** — the rail appears beside the grid; the grid keeps ~940px.
3. **768 and 375** — the strip is still there, still scrolls sideways, still shows all three AC-12 fields.
4. **Empty** — `ไม่มีรายการที่พักไว้` is present at every width. (AC-11's real failure is a tray nobody can find
   *because it was empty the first time they looked.*)

## Questions — FE

**Q3 (blocking for the batch, not for me): the pause/resume contract is unwritten.** Shapes I assumed are in the
table above, all in one file. **Please reconcile with TASK-260 before either half is called done** — DEPLOY
RULE 3 makes them one shipment, and I would rather this be settled in a review than discovered on the server.

**Q4 (small, and yours): does the backend exclude `PAUSED` from `GET /calendar`?** The payload filters only
`CANCELLED` today. I added the FE guard because AC-10 is a claim about the grid and the grid is mine — but if
the BE does not also exclude it, every *other* consumer of that payload still sees a paused booking as live.
Worth putting in @Jason's task rather than leaving the two of us to assume it separately.


## Review — Sober, 2026-09-06: ✅ **PASS. TASK-261 is DONE (code).** 🔴 **Q3 is my error, and it is ratified into TASK-260.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **99 pass / 0 fail** (11 files, 208 expects) ·
`OFF_CALENDAR_STATUSES` defined once (`types/app/scheduler/index.ts:125`) and read by **both** grids
(`CalendarGrid.tsx:68`, `CalendarWeekGrid.tsx:70`). ✅ `GET /bookings?status=PAUSED` is real —
`scheduler.service.ts:756` already filters on status.

### 🔴 Q3 — the contract did not exist, and that is on me
I wrote *"build against the contract, not against a running server"* **and never wrote a contract.** Splitting a
requirement across two engineers without pinning the interface is exactly the gap DEPLOY RULE 3 exists to close,
and **I opened it in the same task where I invoked the rule.**
✅ **You did not guess quietly** — you took REQ-071's course pause/resume shapes so the same verb keeps one
convention, put the assumption in a table, and asked for reconciliation **before** either half is called done.
⇒ **Your shapes are now the contract**, written into `TASK-260` §8 as non-negotiable.
📌 **And the no-body pause is the better half of that choice:** with no field to put one in, **AC-8's reason
cannot be sent even by accident.** *"The absence becomes structural instead of a promise"* — kept, in your words.

### ✅ Q4 — already mandated, and your instinct was right
The backend payload filters only `ne(status,'CANCELLED')`. **@Porter asked the same question hours ago and
`TASK-260` §1a now requires the BE to exclude `PAUSED` too**, with `CALENDAR_HIDDEN_STATUSES` named beside the
slot list. ⇒ **two independent guards for AC-10, and you were right that yours is not a substitute** — every
*other* consumer of that payload needs the server-side one.

### 🔴 The arithmetic is the review
> *"I would have shipped the rail at 1280 if I had not done the sums."*

**That sentence is what the board's FE rule is for.** A right-hand rail looks obviously correct until you notice
the grid's own minimum is **1210px inside a 976px main area** — it is already scrolling — and a 292px rail takes
it to **~3.5 day columns from 5.4.** ⇒ rail at `2xl`, **strip below it.** 📌 **You changed your own answer because
of a number**, and you showed the number. That is the difference between a layout decision and a preference.
✅ **And Q2's refusals are right for the stated reason:** not a count (fails AC-12, which is about telling two rows
apart *without opening either*) and never hidden (fails AC-9 for whoever is on a laptop that day).

### ✅ AC-10 — you did the half I did not ask for, and named why
**Rendering outside the grid is only half of "never a calendar cell."** A paused booking keeps its date, so it is
perfectly renderable and **would quietly draw itself back into the grid it is supposed to have left.** Both grids
previously carried the exclusion as **two separate literals**; they now read one, with the old literal asserted
gone. **TASK-239's lesson applied on your side, unprompted** — two copies of *"which statuses are off the
calendar"* is precisely how the day view and the week view come to disagree.

### ✅ Rules as pure functions, and one test title I want quoted back
`canPauseBooking` / `canResumeBooking` / `canSubmitResume` instead of `&&` conditions — *"a rule that only lives
in an `&&` cannot be tested, and AC-1/2/3/13 are what this requirement is made of."*
📌 **And the best assertion in the batch so far:** AC-8 asserted as an absence **at both places a reason could get
in**, under the test name *"offering a reason here would teach staff that พัก and ยกเลิก are the same act."*
**The reason is in the test, so the next person who deletes it has to read why first.** Likewise asserting the
word **ระงับ** never appears — *a test rather than a comment, because a later editor "improving" the wording is
exactly how a customer's own word gets replaced by ours.*

### ⚠️ Not done — and I am accepting it, with the reason
**The §4 deployed measurement did not happen** — `/scheduler/*` is behind an auth proxy you may not fill, as on
five previous tasks. **You called your numbers arithmetic, not a measurement, and refused to dress it up.**
✅ **Accepted for review, and it stays OWED**: the tray cannot be judged with real content until TASK-260 exists.
⇒ **It moves to the batch check with the four widths you listed**, and @Porter carries it — **"the batch is
complete" already means the tray renders**, and this is what renders means.
⚠️ **`bun run lint` fails repo-wide** (`next lint` removed in Next 16) — **pre-existing, correctly not fixed
inside a REQ-076 task.** Recorded for whoever owns `package.json`.

**Status → DONE (code).** ⛔ It ships with TASK-260, and not before.
