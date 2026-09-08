**Status:** DONE — code (Sober 09-07, reviewed) — tsc 0 / 1588 pass 0 fail / mutated by both of us (different mutations, different failure sets) / nothing applied. ⛔ Ships with TASK-271. FE fifth copy: recorded, NOT cut as a task — reasoning in the review.

# TASK-270 — 🔴🔴 DEF-1: `PAUSED` never reached the API's status enum, and there are FOUR copies of that list

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-07)
**Cause:** @Tanya on `sid`. `POST …/pause` → **200, `PAUSED`, row written** 🟢 — but the tray's own
`GET /api/bookings?status=PAUSED` → **400 `ZodError`**, so the tray renders `ไม่มีรายการที่พักไว้` **while a
paused booking exists.** 🔴 **As shipped, pause reads as DELETE.** ⛔ **`uat` does not go until this lands.**
📌 She has left `f9fec2b7-…` **paused deliberately as the reproduction. It stays until this is fixed.**
🚫 No migration — the DB enum is already right. No database.

---

## §1 🔻 My error, first, because the fix follows from it

**TASK-260 §8, in my own words:** *"the tray's list · `GET /bookings?status=PAUSED` · — **existing endpoint,
existing filter (`scheduler.service.ts:756`, verified)**"*.

**The filter was verified. The request never reaches it.** `zValidator` rejects it at the boundary, one layer in
front of the line I checked. ⇒ **I verified the half that could not fail and called the whole thing verified.**
📌 **Same sentence as TASK-267's `--plan`:** *a check that stops one step short of the risky part is a comfort.*
Third time this week, and the first one I caused after writing the rule down.
⚠️ **And @Jason concurred** — *"I have no objection to any of the three"* — **so it passed two people.** That is
not a second person's fault; **it is what a claim labelled "verified" does to the next reader.**

## §2 🔴 The defect is not a missing value. It is FOUR lists of the same thing.

| File | Values | Has `PAUSED`? | Has `NO_SHOW`? |
|---|---|---|---|
| `src/db/schema.ts:50` `pgEnum("booking_status")` | **9** | ✅ | ✅ |
| `src/validation.ts:45` `BOOKING_STATUS` | 7 | 🔴 no | 🔴 no |
| `src/types/contract.ts:21` `BookingStatus` | 7 | 🔴 no | 🔴 no |
| `src/openapi/document.ts:70` `BookingStatus` | 7 | 🔴 no | 🔴 no |

**`PAUSED` reached ONE of the four.**
🔴 **And `NO_SHOW` has the identical defect and nobody has ever found it** — `GET /api/bookings?status=NO_SHOW`
is a 400 today. It has no writer any more (`jobs.service.ts` writes `ATTENDED`), **but historical rows exist and
still render** (`line-i18n.ts:286` `status_NO_SHOW`), and **they cannot be listed.**
⇒ **The defect is not that someone forgot a line. It is that forgetting is possible**, and it has now happened
twice — once found by a tester, once not found at all.

## §3 The fix — ONE source, and the DB enum is it

**`bookingStatus.enumValues` is the truth** (the database rejects anything else). The other three **derive**:
- `validation.ts` → `z.enum(bookingStatus.enumValues)`
- `types/contract.ts` → `(typeof bookingStatus.enumValues)[number]`
- `openapi/document.ts` → `[...bookingStatus.enumValues]`

✅ **I checked the one thing that could have made this unsafe: `BOOKING_STATUS` has exactly ONE use** —
`bookingsQuery.status` (`validation.ts:91`), a **read filter**. **The write path takes verbs, not statuses**
(`updateStatus` = `confirm | attend | sick-leave | cancel`), so **widening the read enum opens no write hole** and
nobody can `PATCH` a booking straight to `PAUSED` past `pauseBooking`'s guards. **If you find a second consumer,
stop and tell me** — that check is the whole reason this is safe.

⚠️ **`tsc` may light up**, because `BookingStatus` gains two members and some `switch` sites are exhaustive
(`course-history.ts:54,60` at least). **That is the point, not an obstacle: each site is a decision.**
🚫 **Do NOT paper over it with a `default:` or a cast.** If it cascades further than a handful of sites, **stop
and report the list** rather than mass-editing — I would rather scope a second task than have you guess at what
a screen should do with a paused row.

🚫 **Do not touch `SLOT_INACTIVE_STATUSES` / `CALENDAR_HIDDEN_STATUSES` / the `findFreeExtensionDate` list.**
**Those are different in kind and must stay separate:** each answers a QUESTION (*"does this free the slot?"*,
*"does this show on the calendar?"*) and has a real reason to differ. **These four are the same list of every
status, and have no reason to exist four times.** 📌 Merging the two families would be the opposite mistake.

## §4 What must not change
- 🚫 The DB enum and `0032` — already correct.
- 🚫 `pauseBooking` / `resumeBooking` and their guards.
- 🚫 The service-layer filter at `scheduler.service.ts:756` — it was right all along.
- 🚫 `updateStatus`'s verb list. **The read enum widening must not reach the write path.**

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] 🔑 **A test that queries EVERY value in `bookingStatus.enumValues` through `bookingsQuery` and expects it
      to parse** — so a future enum value cannot be added to the database and rejected by the API. **The test
      must read the DB enum, not a hand-written list** — a hand-written list in the test is a fifth copy.
- [ ] The three derive from `bookingStatus.enumValues`; **asserted that no literal status list remains** in
      `validation.ts` · `types/contract.ts` · `openapi/document.ts`
- [ ] `?status=PAUSED` **and** `?status=NO_SHOW` both parse
- [ ] `updateStatus` still takes only the four verbs — asserted, **because that is what makes §3 safe**
- [ ] **Break it and watch:** remove one value from the derivation and show the enumerate-the-enum test fails
- [ ] 🚫 No migration, no database, no change to the pause/resume guards

## Questions
1. **Is `types/contract.ts` imported by anything that must not pull `db/schema`?** The derivation makes it a
   value import, not a type-only one. I believe this repo is one Bun process and it is fine — **check, and if it
   is not, put the tuple in its own tiny module and have `pgEnum` read THAT.** Either shape is fine; **two
   hand-written copies is not.**
2. ⚠️ **Is there a FE-side copy of this list too?** `smart-scheduler-front` has its own
   `types/api/contract.ts`. **Do not change it** — you own the backend — **but tell me what you find** and I will
   cut it for @Fern. **A fifth copy across the wire is the same defect with a network hop in it.**

---

# ✅ Jason (BE) — DONE, code. 2026-09-07

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1588 pass / 0 fail, 124 files**
🚫 No migration (35 `.sql` = 35 tags, untouched) · no database · pause/resume guards untouched ·
`scheduler.service.ts:756` untouched · `updateStatus`'s verb list untouched.
New: `src/validation-booking-status.test.ts` (10 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1588 / 0**, 124 files
- [x] 🔑 A test that queries **every value in `bookingStatus.enumValues`** through `bookingsQuery` — **it reads
      the DB enum**, so it grows by itself and a hand-written list here would have been a fifth copy
- [x] All three derive; **asserted no literal status list remains** in `validation.ts` · `types/contract.ts` ·
      `openapi/document.ts`
- [x] `?status=PAUSED` **and** `?status=NO_SHOW` parse — named individually as well as covered by the loop
- [x] `updateStatus` still takes only the four verbs — asserted **both ways** (the verbs pass, `PAUSED` /
      `ATTENDED` / `pause` are refused)
- [x] **Broke it and watched:** removing `PAUSED` from the derivation fails **3** tests, including the
      enumerate-the-enum one
- [x] 🚫 No migration, no database, no change to the pause/resume guards

## The shape
`bookingStatus.enumValues` is the one list. `validation.ts` → `z.enum(bookingStatus.enumValues)` ·
`types/contract.ts` → `(typeof bookingStatus.enumValues)[number]` · `openapi/document.ts` →
`[...bookingStatus.enumValues]`.
✅ Also asserted that deriving did **not** become *"accept anything"*: `NOT_A_STATUS`, lowercase `paused` and `""`
are still clean 400s. A widened filter that silently returned the whole table would be a worse defect than the one
being fixed.

## ⚠️ `tsc` did NOT light up — and the reason is not that it is safe
You predicted exhaustive switches would break, naming `course-history.ts:54,60`. **They did not, and the reason
matters:** `bookingEventKind` takes `{ status: string }`, **not `BookingStatus`** — so it was never exhaustive and
the compiler had nothing to say. Its `default:` returns `"scheduled"`, with a comment listing
*"CONFIRMED / PENDING / PENDING_RESCHEDULE"*. **`PAUSED` would fall into that default and render a paused session
as `scheduled` in a course's history.**
✅ **It cannot happen, and not because of the type:** `pauseBooking` refuses any booking that has a `courseId` at
all (AC-3), and `course-history` only ever sees course bookings. ⇒ **The safety here comes from a guard three
files away, not from the switch.** Recorded because a silent `tsc` reads as *"nothing to decide"*, and what it
actually meant was *"nothing was asking"*.

## 🔴 A FIFTH enumeration, live on a teacher's phone — reported, not fixed (§3's instruction)
This is not one of the four and I did not touch it. **It is the same defect, one layer out, and it is real today:**

1. **`line-i18n.ts:281-286` has SIX `status_*` label keys** — no `PAUSED`, no `PENDING_RESCHEDULE`, no
   `CANCELLED`.
2. **`line-schedule.ts:68-69` renders `t(\`status_${r.status}\`, lang)`**, and `t()` **returns the key** for an
   unknown one (`line-i18n.ts:384`, *"defensive — an unknown key never crashes a reply"*).
3. **`findBookingsForTeacher` (`checkin.service.ts:114`) filters `ne(b.status, "CANCELLED")`** — a hand-written
   single-status exclusion, **the exact shape TASK-260 named as *"how the next status gets missed"***.

⇒ **A paused booking appears in a teacher's `ตาราง` reply, and renders as the literal string `status_PAUSED`.**
Two defects at once: it should not be there at all (`CALENDAR_HIDDEN_STATUSES` says a paused booking is off the
grid), and the label is a raw key.
🔴 **And `PENDING_RESCHEDULE` has had the identical bug for far longer and nobody has found it** — it is not
filtered and has no label either. **Third instance of the same shape this week; this one was never reported
because a B.1 row is rare and a teacher reading `status_PENDING_RESCHEDULE` would assume it was our jargon.**

🚫 **Not fixed here, deliberately, on your §3 rule:** *"I would rather scope a second task than have you guess at
what a screen should do with a paused row."* **Both halves are product decisions**: whether the teacher's
schedule should hide a paused session or show it as `พัก`, and what `PENDING_RESCHEDULE` should read as to a
coach. **Two lines of code, neither of them mine to choose.**

## Answers

### Q1 — **safe, and `types/contract.ts` gains NO runtime import at all.**
`import type { bookingStatus } from "../db/schema"` + `typeof` is legal and stays type-only. ⇒ the derivation is
erased at compile time and **nothing that imports the contract can end up opening a database**. Asserted, and
belt-and-braces: the test also checks the file has no value `import {`.
📌 Even the value imports are harmless: **`db/schema.ts` imports only `drizzle-orm/pg-core`** — the connection
lives in `db/index.ts`, a different module — so `validation.ts` and `openapi/document.ts` pulling it opens no
socket either. ⇒ **No tiny-tuple module needed; the second shape you offered is unnecessary.**
📌 And its three consumers were already `import type` (`bulk-confirm.ts`, `scheduler.service.ts`, plus a doc
reference in `openapi/document.ts`), so nothing downstream changed shape.

### Q2 — **yes, a FIFTH copy across the wire — and it is COMPLETE, which is the uncomfortable part.**
`smart-scheduler-front/src/types/api/contract.ts:13` is a hand-written union of **all nine**, `PAUSED` and
`NO_SHOW` included — @Fern added `PAUSED` for REQ-076 with a comment explaining the hold.
🔴 **So the FRONTEND's contract was correct while the BACKEND's published contract was wrong.** For the whole of
REQ-076 the FE knew about a status our own OpenAPI document said did not exist, and our validator rejected.
⇒ **It agrees today and has no mechanism to keep agreeing** — which is this task's sentence, with a network hop
in it. **Not touched (it is @Fern's), reported for you to cut.**
📌 `BookingStatusAction` (`:450`) is the four verbs and matches ours — **that one is fine**, and it is worth
saying so: the write path has never had this problem, on either side.

## Review — Sober, 2026-09-07: ✅ **PASS. TASK-270 is DONE (code).** 🔴 **And your fifth enumeration is a live LINE defect — cut as TASK-271, which ships WITH this.**

**Reproduced, and I mutated it myself:** `bunx tsc --noEmit` → **0** · `bun test` → **1588 pass / 0 fail**,
124 files · 35 `.sql` unchanged · nothing applied.
`validation.ts:61` = `z.enum(bookingStatus.enumValues)` · `types/contract.ts:13` = **`import type`** ·
`openapi/document.ts:76` = `[...bookingStatus.enumValues]` · `scheduler.service.ts:756` and `updateStatus`
untouched.

**My mutation — removed `"PAUSED"` from the `pgEnum` itself** ⇒ **2 tests fail**, both in the new file, including
*"enumerate the DB enum — not a list typed here"*.
📌 **You report 3, and I am NOT calling that a miscount:** you mutated *the derivation*, which also trips
*"no literal status list remains"*. **Two different mutations, two different failure sets, and the suite catches
both** — the defect **and** the shortcut that would reintroduce it. **That is better coverage than either number
suggests on its own.** ✅ **I checked before saying it**, which is the thing I got wrong on TASK-269.

### 🔑 The `tsc` finding is the one I would have missed
I predicted the compiler would light up on `course-history.ts`. **It did not, and your reason is the valuable
part:** `bookingEventKind` takes **`{ status: string }`**, so it was **never exhaustive** — *"a silent `tsc`
reads as 'nothing to decide', and what it meant was 'nothing was asking'."*
✅ **And you did not stop at the type:** a `PAUSED` row would fall into that `default:` and render as
`scheduled`, **except that `pauseBooking` refuses anything with a `courseId`** — so **the safety comes from a
guard three files away, not from the switch.** **Naming where the safety actually lives, rather than concluding
"it compiles", is the difference between checking and knowing.**

### Q1 — accepted, and better than either option I offered
`import type` + `typeof` **erases entirely**, so the contract gains no runtime import; and you went further and
established that `db/schema.ts` imports only `drizzle-orm/pg-core` — **the connection is a different module** —
so even the value imports open nothing. ⇒ **my tiny-tuple fallback was unnecessary.** ✅ And asserting the file
has no value `import {` is the right belt: **the property that makes it safe is now enforced, not observed.**

### Q2 — 🔴 the fifth copy is COMPLETE, and that is the uncomfortable part
`smart-scheduler-front/.../contract.ts:13` lists **all nine**, `PAUSED` included, added by @Fern for REQ-076.
⇒ **the FRONTEND's contract was right while our published OpenAPI said the status did not exist and our
validator rejected it.** **The client was ahead of the server's own description of itself.**

**My ruling: I am NOT cutting an FE task, and here is why** — the FE list is **correct today**, so there is no
defect to fix; what is missing is a *mechanism*, and the only real ones are **(a)** generate the FE types from
our OpenAPI document (now derived from the DB enum, so it is finally a truthful source) or **(b)** a contract
test across two repos. **Both are decisions about how the repos relate, not a bug fix**, and cutting a task that
says *"make them agree"* without naming the mechanism would be a note pretending to be a control — **the exact
failure this week has been about.** ⇒ **Recorded in `SYSTEM-FACTS.md`; it goes to @Porter as an option, not a
task.** ✅ **And your note that `BookingStatusAction` matches on both sides is worth as much as the finding:
the write path has never had this problem, on either side, and knowing where a defect ISN'T bounds it.**

### 🔴 TASK-271 — your fifth enumeration, cut, with two things you could not have known
`tasks/TASK-271-a-paused-session-renders-as-a-raw-key-on-a-teachers-phone.md`.
1. **`CALENDAR_HIDDEN_STATUSES`'s own comment describes this bug in these words** — *"a hand-written
   `ne(status, 'CANCELLED')` … is exactly how the next status gets missed."* **TASK-260 wrote that, fixed the
   instance it found, and a second instance survived in another file.**
2. **I swept the remaining five hand-written `CANCELLED` exclusions and they are NOT five copies** — each answers
   a different question and **four already differ in the right direction**. §4 has my read on each. 🚫 **Change
   `checkin.service.ts` only.** In particular `scheduler.service.ts:1206` (a voucher's bookings) should almost
   certainly keep counting a paused session: *no money, no entitlement* means the hour stays held.
✅ **Your restraint was right.** Both halves were product decisions; **one of them I can rule (hide it — REQ-076
already answered it), and one I cannot** (`PENDING_RESCHEDULE`'s wording), so §5 gives you a placeholder that is
labelled as one and @Porter is asking the customer.
