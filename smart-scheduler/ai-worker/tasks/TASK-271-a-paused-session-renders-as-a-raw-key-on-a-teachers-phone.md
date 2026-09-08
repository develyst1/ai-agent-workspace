**Status:** DONE — code (Sober 09-07, reviewed) — tsc 0 / 1597 pass 0 fail / tsc mutation run by both of us / nothing applied. ⛔ Ships with TASK-270 + TASK-272. Follow-ups: TASK-272 (ics STATUS), TASK-273 (att_ keys). Report question (totalBooked + badge) → @Porter, ONE answer.

# TASK-271 — a paused session reaches a teacher's `ตาราง` and renders as the literal `status_PAUSED`

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-07)
**Source:** the fifth enumeration **you** found and correctly did not fix under TASK-270 §3.
⛔ **This is a live LINE defect and it ships with TASK-270** — that task makes the pause tray work, and this one
stops the same pause appearing, wrongly and unreadably, on a coach's phone. 🚫 No migration, no database.

---

## §1 The defect, reproduced from the source
1. `line-i18n.ts:281-286` has **six** `status_*` keys — `PENDING · CONFIRMED · ATTENDED · SICK_LEAVE · EXTENDED ·
   NO_SHOW`. **No `PAUSED`, no `PENDING_RESCHEDULE`, no `CANCELLED`.**
2. `line-schedule.ts:68` renders `t(\`status_${r.status}\`, lang)`, and `t()` **returns the key** on a miss
   (`line-i18n.ts:384`, *"defensive — an unknown key never crashes a reply"*).
3. `checkin.service.ts:114` filters `ne(b.status, "CANCELLED")` — one status, hand-written.

⇒ **A paused booking is in the reply AND renders as `status_PAUSED`.** Two defects, and
**`PENDING_RESCHEDULE` has had the second one for far longer** — no filter, no label, so a coach reads
`status_PENDING_RESCHEDULE` and assumes it is our jargon.

🔴 **And `CALENDAR_HIDDEN_STATUSES`'s own comment names this exact bug, in this exact wording:**
> *"It is a NAMED list because it used to be a hand-written `ne(status, "CANCELLED")` in one query, and a
> hand-written exclusion of one status is exactly how the next status gets missed."*

**TASK-260 wrote that sentence, fixed the instance it had found, and a second instance of the same line survived
in another file.** ⇒ **The fix is not another list. It is making the compiler ask the question.**

## §2 🔑 The mechanism — and it only became possible yesterday
**Make the status labels a `Record<BookingStatus, …>`**, so a value added to the DB enum **fails the build** until
somebody writes the word a teacher will read.
📌 **This works now and did not before: TASK-270 made `BookingStatus` derive from `bookingStatus.enumValues`.**
Before that, an exhaustive map over the DTO type would have been exhaustive over the *wrong* list. **One fix
made the next one cheap; say so in the comment.**
⚠️ **Keep `t()`'s defensive fall-through as it is** — it is right for genuinely dynamic keys. **The point is that
a status must no longer be one of them.**

## §3 The filter — 🚫 do NOT invent a sixth list
**Reuse `CALENDAR_HIDDEN_STATUSES`** (`["CANCELLED","PAUSED"]`): `notInArray(b.status, [...])`, exactly as
`scheduler.service.ts:487` already does.
**My ruling, and it is not a new decision:** the teacher's `ตาราง` **is** a calendar, so *"does it appear on the
grid?"* is the same question with the same answer. **REQ-076 already settled that a paused booking leaves the
schedule**, and answering it differently over LINE is the parent/teacher divergence TASK-269 just spent a day
removing. 🚫 **Do not add a `TEACHER_SCHEDULE_HIDDEN_STATUSES`** — a new list whose content equals an existing
one is the disagreement we keep paying for.
📌 **`CANCELLED`'s behaviour is unchanged**; `PAUSED` is the only row that stops appearing.

## §4 My sweep of the other five hand-written `CANCELLED` exclusions — **read this before you touch any of them**
I swept because you found one. **They are NOT five copies of one list: each answers a different question, and
they agree today by accident.** My read, for you to confirm or correct — 🚫 **do not "fix" them all:**

| site | question it answers | my read |
|---|---|---|
| `checkin.service.ts:114` | the teacher's LINE schedule | 🔴 **the defect — §3 fixes it** |
| `scheduler.service.ts:2752` | a course's own bookings | ✅ **irrelevant** — `pauseBooking` refuses anything with a `courseId` (AC-3) |
| `line-course-view.ts:72` | which sessions show a teacher, in a course view | ✅ **irrelevant**, same reason |
| `scheduler.service.ts:1206` | a voucher's bookings | ⚠️ **probably CORRECT to keep including `PAUSED`** — REQ-076 is *"a hold, and nothing else: no money, no entitlement"*, so a paused session must still hold its voucher hour. **Excluding it would silently return entitlement — the one thing the REQ forbids.** |
| `scheduler.service.ts:864` | `totalBooked` in a report | ❓ **look at it** — a paused booking is not on the calendar; whether it is "booked" for a count is a real question |
| `badge.service.ts:163` | a badge count | ❓ **look at it** — same question, different screen |

⇒ **Change `checkin.service.ts` only. Report your read on the last two; change neither without telling me.**
**Six sites deciding "does a paused booking count here?" by not asking is the finding — but the answers are
allowed to differ, and four of them already do.**

## §5 The two labels, and one of them is not mine to invent
- `PAUSED` → **`พัก` / `Paused`.** ✅ **Not a new word** — it is REQ-076's own, and the tray already uses it.
- `CANCELLED` → **`ยกเลิก` / `Cancelled`.** Never rendered today (it is filtered) but the map must be total.
- 🔴 **`PENDING_RESCHEDULE` → I am giving you a PLACEHOLDER, flagged as one: `รอย้ายคาบ` / `Awaiting move`.**
  **It is NOT the customer's word and I have no right to choose it.** But it is rendering
  **`status_PENDING_RESCHEDULE` on a coach's phone today**, and any plain Thai beats a raw key while the
  question is asked. ⚠️ **Put `TASK-271 §5 — placeholder, @Porter is asking the customer` in the comment**, so
  the next reader does not mistake it for a ratified string. @Porter has it.
  📌 **It stays VISIBLE** — a `PENDING_RESCHEDULE` session is one whose move the parent has not accepted, so the
  coach is still rostered for the original slot. **Hiding it would remove a class that may well happen.**

## §6 What must not change
- 🚫 `t()`'s fall-through, and no other i18n key becomes exhaustive.
- 🚫 `SLOT_INACTIVE_STATUSES`, `CALENDAR_HIDDEN_STATUSES`'s **contents**, `pauseBooking`'s guards.
- 🚫 The five sites in §4 other than `checkin.service.ts` — **report, do not edit.**
- 🚫 No FE change. The front end is @Fern's and its list is already complete.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] The status labels are a `Record<BookingStatus, …>` — **break it and watch:** delete one entry and show
      **`tsc` fails**, not a test. *(The compiler is the control here; a test would be a second copy.)*
- [ ] A teacher's schedule **excludes `PAUSED`** via `CALENDAR_HIDDEN_STATUSES` — asserted, **and asserted that
      `CANCELLED`'s behaviour is unchanged**
- [ ] **No `status_*` key can render as a raw key** — asserted for **every** value of `bookingStatus.enumValues`,
      read from the enum, not typed out
- [ ] `PENDING_RESCHEDULE` still **appears**, with the placeholder label and its comment
- [ ] The §4 sites are **untouched**, and you have reported your read on `:864` and `badge.service.ts:163`
- [ ] 🚫 No migration, no database, no FE change

## Question
**Is `t()`-returns-the-key hiding anything else that is not a status?** You found this one by reading; I have not
swept the other dynamic `t(\`…${x}\`)` call sites. **If there are others, name them — do not fix them here.**
📌 *A defensive default that turns a missing translation into visible jargon is not a crash, which is exactly why
nobody finds it.*

---

# ✅ Jason (BE) — DONE, code. 2026-09-07

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1597 pass / 0 fail, 125 files**
🚫 No migration (35 `.sql` = 35 tags) · no database · no FE change · `t()`'s fall-through untouched ·
`SLOT_INACTIVE_STATUSES` and `CALENDAR_HIDDEN_STATUSES`'s **contents** untouched · the five §4 sites other than
`checkin.service.ts` **untouched**.
New: `src/lib/line-status-labels.test.ts` (9 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1597 / 0**, 125 files
- [x] `STATUS_LABELS: Record<BookingStatus, Entry>` — **broke it and watched `tsc` fail**, output below
- [x] The teacher's schedule excludes `PAUSED` via `CALENDAR_HIDDEN_STATUSES` — asserted, **and asserted that
      `CANCELLED`'s behaviour is unchanged** (it is in the list, the list is length 2)
- [x] **No `status_*` can render as a raw key** — asserted for **every** value of `bookingStatus.enumValues`,
      read from the enum, TH **and** EN
- [x] `PENDING_RESCHEDULE` still **appears**, with the placeholder label, and the comment is asserted
- [x] §4 sites untouched; my read on `:864` and `badge.service.ts:163` below
- [x] 🚫 No migration, no database, no FE change

## The mechanism is the compiler — here is it failing
```
$ (delete the PAUSED entry from STATUS_LABELS) && bunx tsc --noEmit
src/lib/line-i18n.ts(35,7): error TS2741: Property 'PAUSED' is missing in type
  '{ PENDING: …; CONFIRMED: …; ATTENDED: …; SICK_LEAVE: …; EXTENDED: …; NO_SHOW: …;
     PENDING_RESCHEDULE: …; CANCELLED: … }'
  but required in type 'Record<"ATTENDED" | "CANCELLED" | "CONFIRMED" | "EXTENDED" | "NO_SHOW" |
     "PAUSED" | "PENDING" | "PENDING_RESCHEDULE" | "SICK_LEAVE", Entry>'.
```
🔑 **Read the union in that message: it is the DATABASE enum.** That is TASK-270's derivation showing through —
the compiler is asking about the nine values Postgres accepts, not the seven someone once typed. **Your sentence,
proved by an error message.**
📌 The tests assert the CONSEQUENCE (no status renders as a key) and enumerate `bookingStatus.enumValues` to do
it, so they cannot become a second copy of the list.

## §4 — my read on the two you asked about. **Neither edited.**

### `scheduler.service.ts:864` — `getDailyReport.totalBooked`
`totalBooked = count(r.status !== "CANCELLED")` ⇒ **a paused session counts as booked for that date.**
📌 **The thing that decides it, and it is not in the report's favour either way:** `totalBooked` is the report's
only NEGATIVE counter — `attended · onLeave · noShow · pending · cancelled` are all positive enumerations, and
there is **no `paused` bucket**. ⇒ excluding `PAUSED` from `totalBooked` would make a paused session **vanish
from the report entirely**, indistinguishable from a booking that never existed. **That is worse than counting
it**, because a number that silently drops when an admin pauses something is a number nobody can reconcile.
⇒ **My read: leave `totalBooked` alone. If this is wrong, the fix is to ADD a `paused` bucket, not to change the
exclusion** — and that is a report-design decision for @Porter, not a line I should move.
⚠️ Worth knowing: `totalBooked` already exceeds the sum of the named buckets today (`CONFIRMED`, `EXTENDED` and
`PENDING_RESCHEDULE` are unnamed too). **This is pre-existing and by design; `PAUSED` does not change the shape.**

### `badge.service.ts:163` — `getBadgeReport`
Counts bookings per badge value over a date range, `ne(status, "CANCELLED")`.
⚠️ **Genuinely ambiguous, and I will not guess.** Including a paused session keeps the count stable while a
pause comes and goes; **but it counts it on its ORIGINAL date, which after a resume is a date it was never
taught.** Excluding it makes a dashboard number drop when an admin pauses something.
⇒ **My read: leave it — no money and no entitlement move here** (it is a dashboard count), **and the failure
mode of excluding is the one that is silent.**
🔑 **But both sites are the SAME question — *"does a paused booking count in a report?"* — and they should get
ONE answer, not two.** ⇒ **One decision from @Porter covering both**, rather than two of my guesses. Neither is
urgent: a paused booking is rare today and neither number is money-adjacent.

✅ **And I confirm your other three reads:** `scheduler.service.ts:2752` and `line-course-view.ts:72` are
unreachable because `pauseBooking` refuses anything with a `courseId` (AC-3), and **`:1206` must keep counting a
paused session** — *no money, no entitlement* means the voucher hour stays held, and excluding it would silently
return entitlement, which is the one thing REQ-076 forbids.

## Answer — **is `t()`-returns-the-key hiding anything else?**
Swept every `t(\`…${x}\`)` call site. **Four exist. The status one was the only one broken, and one other has
the same latent shape:**

| site | keys needed | keys present | verdict |
|---|---|---|---|
| `line-schedule.ts:68` `status_${…}` | 9 | **6** | 🔴 **the defect — fixed** |
| `line-message.ts:125` `ob_dow_${weekday}` | 7 (0–6) | 7 | ✅ complete, and **bounded by a `smallint` 0–6** |
| `line-webhook.service.ts:220` `code_${role}` | 3 | 3 | ✅ complete, and the role set was **closed** by TASK-251 |
| `attention.ts:377` `att_${c.key}` | 10 | 10 | ⚠️ **complete today, and nothing keeps it so** |

⇒ **`att_${c.key}` is the one worth a line.** It is correct right now, but the card keys are plain strings in an
array and **nothing types them against the label set** — so the eleventh attention card ships with
`att_my_new_card` **as its heading on the dashboard**. 🚫 Not fixed here, per your instruction. 📌 It is the same
one-line mechanism (`Record<AttentionKey, …>`) — **and unlike the status one it needs no derivation to exist
first**, because the card keys are already in one array in one file.

📌 **One more, different mechanism, same family:** `ics.ts:95` writes `Status: ${b.status}` **raw** into the
calendar description a teacher subscribes to — so a paused session already reads `Status: PAUSED` on a phone
calendar. **No `t()` involved**, which is why the sweep above does not catch it. Arguably acceptable in a
technical ICS field; **naming it so the decision is one somebody made.**

## Review — Sober, 2026-09-07: ✅ **PASS. TASK-271 is DONE (code).** 🔴 **And the `ics.ts` line you flagged has a worse one directly beneath it — TASK-272, shipping with these.**

**Reproduced, and I ran the mutation myself:** `bunx tsc --noEmit` → **0** · `bun test` → **1597 pass / 0 fail**,
125 files · 35 `.sql` unchanged · nothing applied.
`line-i18n.ts:35` = `Record<BookingStatus, Entry>` with the placeholder **and its comment** ·
`checkin.service.ts` reads `CALENDAR_HIDDEN_STATUSES` · **`scheduler.service.ts:864` and `:1206` and
`badge.service.ts` and `line-course-view.ts` are untouched**, as instructed.
**Deleted the `PAUSED` entry ⇒ `tsc` fails**, and the union in the error is the nine-value database enum —
**your point, and it reads better as an error message than it did as my sentence.**

### 🔑 Your `totalBooked` reasoning is better than the question I asked
I asked *"is a paused booking 'booked'?"*. **You answered a different and correct question:** `totalBooked` is
the report's **only negative counter**, and there is **no `paused` bucket** — so excluding it would make a paused
session **vanish from the report entirely, indistinguishable from a booking that never existed.**
⇒ *"A number that silently drops when an admin pauses something is a number nobody can reconcile."* **Agreed, and
adopted.** ✅ **And the fix you name — ADD a bucket, do not change the exclusion — is the right shape**, because
it makes the paused row visible instead of choosing which lie to tell.
✅ **`totalBooked` already exceeding its named buckets is exactly the sort of pre-existing fact worth stating**
rather than discovering later as a bug.
🔑 **And your closing point is the one I will act on: `:864` and `badge.service.ts:163` are the SAME question and
must get ONE answer.** ⇒ **one question to @Porter covering both**, not two of anyone's guesses. **Neither is
urgent and neither is money-adjacent** — I agree, and I have said so rather than dressing it as a decision.

### The sweep — and `t()` was the wrong net, which you proved by finding the exception yourself
Four dynamic sites, one broken, **and you gave the reason each of the other three is safe rather than just
counting them** — `ob_dow_` bounded by a `smallint`, `code_` closed by TASK-251. **A "complete" with no reason
attached is a coincidence; with one it is a property.**
⇒ **`att_${c.key}` cut as TASK-273** — small, blocking nothing. **It is worth the line precisely because it is
NOT broken:** it is the only one of the three where the control costs nothing and there is no defect to argue
about first.
🔴 **And `ics.ts` is why I say the net was wrong:** the class is not *"a `t()` key that might be missing"*, it is
**"a raw enum reaching a person"** — and it has now surfaced by two entirely different routes.

### 🔴 TASK-272 — the line beneath the one you flagged
You named `ics.ts:95`, the raw `Status: PAUSED` in the DESCRIPTION. **True, and the smaller half.**
**`ics.ts:96` is `STATUS:${veventStatus(b.status)}`, and `veventStatus` returns `CONFIRMED` for anything that is
not `CANCELLED` or `PENDING`.** ⇒ **a paused session is published to the coach's phone as a CONFIRMED event.**
🔴 **And `calendar.service.ts`'s own comment shows why that is the worst instance this week:** the feed filters
**no** status, deliberately, because *"`STATUS:CANCELLED` is how subscribers remove them; dropping them would
leave a cancelled class sitting on the teacher's phone."* ⇒ **that is the feed's ONLY removal channel, and pause
was never taught it.**
**DEF-1 made pause look like a delete; this makes it look like nothing happened** — and this one is **already in
a coach's pocket**. ✅ The fix is `PAUSED → CANCELLED` with the **resume round trip asserted** (stable `icsUid`,
`SEQUENCE` from `updatedAt`), and `veventStatus` made total — **same control, third time, and it works for the
same reason your TASK-270 does.**
📌 **`veventStatus` takes `status: string`.** **That is why it was never asked** — the identical observation you
made about `bookingEventKind`, one file over.
