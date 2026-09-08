**Status:** DONE — code (Sober 09-07, reviewed) — tsc 0 / 1609 pass 0 fail / tsc mutation run by both of us / nothing applied. ⛔ Ships with TASK-270 + TASK-271 — the pause shipment is COMPLETE. Follow-up: TASK-274 (@Fern), found by taking his sweep across the wire.

# TASK-272 — 🔴 a paused session stays on a teacher's subscribed phone calendar, **as `CONFIRMED`**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-07)
**Source:** the `ics.ts` line **you** flagged at the end of TASK-271 — **and the line one below it, which is the
real one.** ⛔ **Ships with TASK-270 + TASK-271.** 🚫 No migration, no database, no FE change.

---

## §1 It is not the `DESCRIPTION` line. It is `STATUS:`.
You named `ics.ts:95` — `Status: ${b.status}` written raw into the description. **True, and the smaller half.**
**One line below**, `ics.ts:96` is `STATUS:${veventStatus(b.status)}`, and:
```ts
function veventStatus(status: string): "CONFIRMED" | "TENTATIVE" | "CANCELLED" {
  if (status === "CANCELLED") return "CANCELLED";
  if (status === "PENDING")   return "TENTATIVE";
  return "CONFIRMED";                    // ← PAUSED lands here
}
```
⇒ **A paused session is published to the coach's phone as a CONFIRMED event.**

## §2 🔴 Why this is the worst instance of the week, and the design is not at fault
`calendar.service.ts` says it in its own comment:
> *"CANCELLED bookings are **included** on purpose — they're serialized with `STATUS:CANCELLED` so subscribers
> remove them; dropping them would leave a cancelled class sitting on the teacher's phone."*

**That is right, and it is the feed's ONLY mechanism for taking a class OFF a phone.** The feed filters **no**
status at all — by design. ⇒ **`STATUS:CANCELLED` is the removal channel, and `PAUSED` was never taught it.**
🔴 **So this is DEF-1's mirror image.** DEF-1 made pause look like a **delete**; this makes pause look like
**nothing happened at all** — and unlike the tray, **the wrong answer is already sitting in a coach's pocket and
stays there until something re-publishes.**

## §3 The fix — `PAUSED → CANCELLED`, and the resume must bring it back
**`PAUSED` maps to `CANCELLED`**, so a subscriber removes the event. **This is the same ruling as TASK-271 §3**
(a paused booking leaves the schedule) applied to the same coach's other screen. 🚫 **Not `TENTATIVE`** — a
paused class is not uncertain, it is not happening.
✅ **Reversible, and prove it:** `icsUid` is stable per booking and `SEQUENCE` comes from `updatedAt`, so a
**resume re-publishes the same UID with a higher SEQUENCE and `STATUS:CONFIRMED`** and the event returns.
**Assert the round trip — pause then resume — not just the pause half.** *(A removal that cannot be undone
would be a worse defect than the one being fixed.)*

## §4 The mechanism — make `veventStatus` exhaustive, and change NOTHING else
**`Record<BookingStatus, "CONFIRMED"|"TENTATIVE"|"CANCELLED">`, every value written out, no `return` fallthrough.**
📌 Same control as TASK-271's labels and it works for the same reason: **TASK-270 made `BookingStatus` derive
from the database.** ⚠️ Note it takes `status: string` today — **that is why it was never asked**, exactly like
`bookingEventKind`. **Type it.**

🚫 **Every status other than `PAUSED` keeps the value it produces TODAY.** Writing them out is a **no-op that
makes each one visible**; it is not licence to improve them.
- `PENDING_RESCHEDULE` stays **`CONFIRMED`**, with a comment saying so explicitly: *"`TENTATIVE` is arguably
  more honest; that is a question, not a default, and it is not being decided inside a defect fix."*
  **It is now visible instead of defaulted, which is the whole point.**
- `SICK_LEAVE` stays **`CONFIRMED`** — `CALENDAR_HIDDEN_STATUSES` deliberately keeps a leave on the grid, and
  the two surfaces must not disagree.

## §5 The `DESCRIPTION` line — fix it too, with the label
`Status: ${b.status}` puts a raw enum in front of a human. **Use `STATUS_LABELS` via `t()`**, in the **teacher's
`lineLang`** — `findBookingsForCalendarToken` already returns the `teacher`, so the language is in hand at the
route.
⚠️ **If threading the language is more than a small change, stop and tell me** — then it becomes its own task.
**Do not hardcode TH and do not leave the raw enum.**

## §6 What must not change
- 🚫 The feed's window, its token rule, `icsUid`, `sequenceOf`.
- 🚫 The decision to include every status in the feed — **it is correct and it is what makes §3 work.**
- 🚫 `CANCELLED`'s and `PENDING`'s current mappings.
- 🚫 No FE change, no migration, no database.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] `veventStatus` is a total `Record<BookingStatus, …>` — **break it and watch `tsc` fail**, paste it
- [ ] `PAUSED` → `STATUS:CANCELLED`; **and the eight others produce byte-identical output to before** —
      asserted, because "no-op" is a claim
- [ ] 🔑 **The round trip: pause → resume re-publishes the SAME `UID` with a HIGHER `SEQUENCE` and
      `STATUS:CONFIRMED`** — asserted. A one-way removal is not a fix.
- [ ] The `DESCRIPTION` carries the **label**, in the teacher's language — or you have told me why it is not small
- [ ] 🚫 No migration, no database, no FE change

## Question
**Does anything else publish a booking status to a human without a label?** You swept the `t()` family and found
this because it is *outside* it. 📌 **`t()` was the wrong net** — the class is *"a raw enum reaching a person"*,
and it has now surfaced in a LINE reply and an ICS feed by two different routes. **Name what you find; fix
nothing here.**

---

# ✅ Jason (BE) — DONE, code. 2026-09-07

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1609 pass / 0 fail, 126 files**
🚫 No migration (35 `.sql` = 35 tags) · no database · no FE change · the feed's window, token rule, `icsUid`,
`sequenceOf` and its **include-every-status** decision all untouched.
New: `src/lib/ics-paused.test.ts` (12 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1609 / 0**, 126 files
- [x] `VEVENT_STATUS` is a total `Record<BookingStatus, …>` — **broke it and watched `tsc` fail**, pasted below
- [x] `PAUSED` → `STATUS:CANCELLED`, and **the eight others are byte-identical to before** — asserted against
      the old chain of ifs reproduced as the expectation, because *"no-op"* is a claim
- [x] 🔑 **The round trip** — same `UID`, strictly rising `SEQUENCE`, `CONFIRMED → CANCELLED → CONFIRMED`
- [x] The `DESCRIPTION` carries the **label**, in the teacher's language — it was small; see below
- [x] 🚫 No migration, no database, no FE change

## The control, failing
```
$ (delete the PAUSED entry from VEVENT_STATUS) && bunx tsc --noEmit
src/lib/ics.ts(86,7): error TS2741: Property 'PAUSED' is missing in type
  '{ PENDING: "TENTATIVE"; CONFIRMED: "CONFIRMED"; ATTENDED: "CONFIRMED"; SICK_LEAVE: "CONFIRMED";
     NO_SHOW: "CONFIRMED"; EXTENDED: "CONFIRMED"; PENDING_RESCHEDULE: "CONFIRMED"; CANCELLED: "CANCELLED" }'
  but required in type 'Record<"ATTENDED" | "CANCELLED" | … | "PAUSED" | …, "CANCELLED"|"CONFIRMED"|"TENTATIVE">'.
```
📌 **Second day running that this error message is the deliverable**, and the union in it is the database's.

## §5 — it was small, so I did it
`findBookingsForCalendarToken` already returns the teacher, so the language was in hand at the route:
`lang: found.teacher.lineLang === "EN" ? "EN" : "TH"` — the same `null → TH` default every other reply uses —
threaded through `buildCalendar`'s opts to `buildVevent`. `DESCRIPTION:Status: พัก` / `Status: Paused`, asserted
in both languages **and** asserted that **no** status publishes as its raw enum name in either.

## 📌 Two things I want on the record, both about the same shape
1. **`veventStatus` took `status: string`, so nobody was ever asked** — the identical observation as
   `bookingEventKind` in TASK-270. **I typed the input as well as the map**, which is what turned a silent
   default into a compiler question. ⚠️ **The `Record` alone would not have been enough**: with a `string`
   parameter the map would still have needed a fallback, and the fallback is the defect.
2. **Typing `IcsBooking.status` broke exactly one thing: the existing test's fixture helper**, which was
   `status: "CONFIRMED"` widened to `string`. **That is the type doing its job on its first day** — the fixture
   could construct a booking whose status no longer existed. Fixed by typing the helper's return, not by casting.

## Answer — **does anything else publish a status to a human without a label?**
🔑 **`t()` was the wrong net, and so is any grep for `t()`. The right question is: which modules COMPOSE text a
human reads?** There are exactly two in this backend — **the LINE layer and the ICS feed** — and both are now
fixed. Everywhere else the backend **emits data and the frontend labels it**, which is correct and is not this
defect class.

Swept every interpolation of a `status` into a string (`${…status…}`) across `src` and `scripts`. **Nothing else
reaches a person:**

| what the sweep found | verdict |
|---|---|
| `line-schedule.ts:68-69` | ✅ fixed, TASK-271 |
| `ics.ts:95-96` | ✅ fixed, here |
| `line-client.ts` · `line-rich-menu.ts` · `ops-client.ts` · `daily-digest.ts` | ✅ **`res.status` — an HTTP code in an error/log**, not a booking status |
| `db/schema.ts:486,662` | ✅ SQL index predicates |

⚠️ **The one place a raw enum still reaches a screen is the API payload itself** — every booking DTO carries
`status: "PAUSED"` — **and that is correct**: it is the contract, and `smart-scheduler-front` labels it. 🚫 Not a
defect and not mine; noted so the sweep reads as complete rather than as having stopped at the wire.
📌 **The generalisation worth keeping:** *a raw enum reaching a person* is bounded by **where text is composed**,
not by which helper is used to compose it — and this backend composes in two places. **That is a checkable
statement; "grep for `t()`" was not.**

## Review — Sober, 2026-09-07: ✅ **PASS. TASK-272 is DONE (code).** 🔑 **And your answer replaced my question with a better one.**

**Reproduced, and I ran the mutation myself:** `bunx tsc --noEmit` → **0** · `bun test` → **1609 pass / 0 fail**,
126 files · 35 `.sql` unchanged · nothing applied.
`ics.ts:86` = `Record<BookingStatus, "CONFIRMED"|"TENTATIVE"|"CANCELLED">`, **`PAUSED: "CANCELLED"`**, the other
eight written out with `SICK_LEAVE` and `PENDING_RESCHEDULE` each carrying the reason they did **not** change ·
`routes/calendar.ts:36` threads `lineLang` with the `null → TH` default every other reply uses.
**Deleted the `PAUSED` entry ⇒ `tsc` fails**, and the union in the error is the database's. **Second day running
that an error message is the deliverable.**

### 🔑 §1 — you typed the INPUT, and that is the part I under-specified
I wrote *"make `veventStatus` exhaustive"*. **You are right that the `Record` alone would not have been enough:**
> *"with a `string` parameter the map would still have needed a fallback, and the fallback is the defect."*

⇒ **The control is the pair — a total map AND a typed input.** I had asked for half of it and would have
accepted half of it. 📌 **Write that down as the general form**, because it is the third time in two days that
the thing hiding the question was a `string` parameter (`bookingEventKind`, `veventStatus`, and `t()`'s key).

### 🔑 And typing it broke a fixture — on its first day
> *"the fixture could construct a booking whose status no longer existed."*

**Fixed by typing the helper's return, not by casting.** ✅ **That is the only correct response to a type
complaining about a test**, and the one place people reach for `as` because "it is only a test". **A fixture that
can build an impossible object is how a suite goes green over a state the product cannot reach.**

### 🔑 The answer — you did not answer my question, you replaced it, and yours is checkable
I asked *"does anything else publish a status without a label?"* and offered a grep-shaped net.
> *"`t()` was the wrong net, and so is any grep for `t()`. The right question is: which modules COMPOSE text a
> human reads? There are exactly two in this backend."*

⇒ **A bounded claim about the architecture instead of an unbounded one about strings.** **The LINE layer and the
ICS feed compose; everywhere else the backend emits data and the front end labels it.** ✅ **And naming the API
payload's raw `status: "PAUSED"` as CORRECT — the contract, labelled by the FE — is what makes the sweep read as
complete rather than as having stopped at the wire.** **Adopted as the standing form of this question.**

### 🔴 I took your sweep across the wire, and there is a fourth instance — still correct
`smart-scheduler-front`:
- ✅ **`BOOKING_STATUS_COLOR` is already `Record<BookingStatus, …>`** — @Fern's control, already there.
- 🔴 **`dictionaries.ts` is not.** All nine labels are present **in both languages, today**, but
  `export const dictionaries = { en, th }` has **no type annotation** ⇒ nothing forces the map to cover
  `BookingStatus`, **and nothing forces `th` to match `en`.**
⇒ **The tenth status ships with no label on the admin's daily screen, in two languages, green build.**
**Cut as TASK-274 → @Fern**, small and blocking nothing. 📌 **Your claim that "the FE labels it" is TRUE — I
checked** — **and what I found is that it is true by care rather than by construction.** That distinction is the
whole point of everything we did today, so it was worth the ten minutes to look.
