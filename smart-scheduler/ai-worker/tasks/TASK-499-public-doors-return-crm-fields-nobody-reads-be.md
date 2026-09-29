# TASK-499 — the PUBLIC check-in doors hand out a child's CRM points, level and perks, with no reader — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** No migration. Found by you in TASK-498 and correctly left alone there.

## §0 What it is
`POST /checkin` (the token page) and the shop-front routes (single **and** batch) answer with `booking`, which carries `studentRef` — and that includes **`crmPoints`, `crmLevel`, `crmLevelName`, `priorityBooking` and `perks`**. These doors take **no JWT**: the credential is a token printed on a QR, or a phone number typed at a counter.
**Nothing renders any of it.** You swept the front end, the LINE strings and the message builders in TASK-498: the fields exist only in the contract type.

## §1 Why it is worth a task rather than a note
It is **low-sensitivity data about the family's own child**, and I am not going to pretend otherwise. But:
- 🔑 **It is the TASK-481 shape exactly: one builder answering two audiences, and the public one getting everything the admin one gets.** That is the pattern that nearly put **an admin's username in a parent's reply** a week ago. The value is small here; **the mechanism is identical, and the mechanism is what bites next time.**
- **Nothing reads it**, so removing it costs nothing and cannot break a screen. **A field with no reader is pure liability** — it can only ever be seen by the wrong person.
- 📌 And it is the third instance this round of *"the DTO decided, and nobody chose"*. We have now fixed that twice deliberately; leaving the third would make the rule look like a preference.

## §2 Build
- The **public** answers carry **no CRM fields**. Use the established pattern: **absent, not null, not masked** — the same shape as `provenance` in TASK-481/488, so there is **one way** to say "this audience does not get this".
- 🔑 **Pin it by KEY SET on each public route** (the token page, shop-front single, shop-front batch), not by checking a value is missing. 📌 Fern's TASK-478 lesson: `toEqual` treats an `undefined` value as an absent key, and a both-ids body slipped past because of it.
- **The admin reads are unchanged** — pin that, by value.
- **Say whether anything else rides `studentRef` onto a public door** that nobody reads. If the honest answer is "the whole of `studentRef` is more than a public door needs", **say so and propose the shape; do not build a second DTO without telling me.**
- 🚫 No change to what a check-in does, to any message, or to the FE contract's admin side. If the FE contract type needs narrowing, name it for @Fern rather than editing her repo.

## Definition of Done
- [ ] No CRM field on any public check-in answer, **absent rather than null**, pinned **by key set** on all three routes · the admin reads pinned unchanged · anything else riding `studentRef` publicly named (and any wider proposal **stated, not built**) · the FE contract's narrowing named for @Fern · suite **count** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that returns the CRM fields as `null` instead of absent, and one that strips them from an admin read · report here + `inbox/SA.md` + log.

---

# 🛑 STOPPED — @Jason → @Sober (2026-09-26) — the honest answer is the one you anticipated, and worse: the PUBLIC doors return the WHOLE admin booking DTO, including the COACH'S PAY RATE and an ADMIN'S USERNAME. Proposal below. **No code written.**

## 🔴 What the public token page actually answers, established BY VALUE, not by reading
I sent a real `POST /api/checkin { token }` through the ROOT app (no JWT, as a parent's phone would) against a course row with a coach rate, a discount and a staff note. `booking` came back with **33 keys: the full `toBookingDTO`**. Among them:
- 🔴 **`rate` = `{ effectiveMinor: 45000, overrideMinor: 45000, defaultMinor: 50000 }`: the COACH'S PAY PER CLASS.** TASK-431 made this key 59, masked by `coachRateMask`. **That middleware never runs on these doors:** `publicCheckin` is routed at `index.ts:72`, the mask is registered at `:84`, and Hono runs handlers in registration order, so the public handler answers first. **Anyone holding a check-in link sees what the coach is paid.** Parents receive those links on LINE.
- 🔴 **`discount.actor` = `"admin-dong"`: an ADMIN'S USERNAME, on a public door.** This is exactly TASK-481's near-miss, and here it is live.
- 🔴 **`note`** is the staff's own note field (my fixture: *"staff: mum paid late, chase"*). It is written by the system and by staff, not addressed to a family.
- **`course`**: the course's internals (`leaveUsed`, `leaveQuota`, `leaveLocked`, `endReason`, `dropReason`…). **`teacher.type`**: the coach's employment type (`FREELANCE`). **`other`**: an OTHER booking's per-teacher rates. Plus `discount.value` / `reason`, `badges`, `rental`, group, camp and reschedule internals.
- **The CRM fields you ticketed**: `crmPoints`, `crmLevel`, `crmLevelName`, `priorityBooking`, `perks` (on `student` and `coStudent`).
- **The same `booking` rides the shop-front answers**, single and batch (they return `checkinByToken`'s body as is, TASK-490), **and the LINE path** (which only reads `already`, but receives the same object in-process).

## What the pages actually READ (the front-end repo, read, not edited)
- **`SuccessView`** (`CheckinContent.tsx`, shared by the token page and the shop-front page, TASK-478) reads **six fields of `booking`**: `student.name`, `subject.name`, `teacher.nickname`, `date`, `startTime`, `endTime`. At the top level it reads `already`, `crmAwarded` and `remaining`. **Nothing else in `booking` has a reader on a public door.**
- **Camp** (`CampSuccessView`) reads `day.{date, half, status, undoReason}` + `credit`, and our camp answer is already narrow (`{ already, day, credit }`, no `booking`). ⚠️ **For @Fern:** that page also reads `day.studentName` and `day.weekName`, **which `dayDTO` never sends**, so those two lines silently render nothing. (`undoReason` IS shown to the family, deliberately: the "undone" line.)

## So: CRM-only removal would leave the worse two in place. Proposal (your call; NOT built)
**One public shape, by ALLOW-list, for every public check-in answer:**
```
booking: { date, startTime, endTime, student: { name } | null, subject: { name } | null, teacher: { nickname } | null }
```
- **Built by one function, `toPublicCheckinBooking(dto)`**, at the ONE place that produces the answer (`checkinByToken`), so the token page, the shop-front single and the batch all get it. The batch is by construction: it relays the single body.
- **An allow-list, not a deny-list.** The TASK-481/488 `provenance` pattern ("absent for this audience") works for ONE field. Here the admin DTO has 33 keys and grows every round (`rate` arrived in TASK-423, `discount.actor` in TASK-171), and **every new admin field would become public by default.** An allow-list inverts that: a new field is private until someone decides a family should see it.
- **Pinned by KEY SET** on all three routes, through the root app (`Object.keys` deep, per Fern's TASK-478 lesson), **plus a by-value pin that `rate`, `discount`, `note`, `course` and the CRM fields are ABSENT.** The admin reads (`GET /bookings/:id`, the calendar) are pinned unchanged.
- **DUO:** the page shows only `student.name` (the first child). I'd keep that shape exactly (no behaviour change) and name it for Fern: `displayName` is the ONE name rule, and a DUO family sees one child's name today.
- 🚫 **Cost to the FE: none.** Every field the pages read survives, so the FE contract just narrows (named for Fern, not edited).
- 📌 **`crmAwarded`** is a top-level constant (the rule's points: 10), not the child's balance. The page shows "+10 points" and I'd keep it. Say if you'd rather it went too.

## Why I stopped rather than built
You said: *"If the honest answer is that the whole of `studentRef` is more than a public door needs, say so and propose the shape — do not build a second DTO without telling me."* The answer goes beyond `studentRef`: it is **the whole `toBookingDTO`**, and two of its fields (**the coach's pay** and **an admin's username**) are more serious than the CRM one. ⚠️ **Severity, for you to weigh:** this is live wherever the public check-in is deployed (sid, uat) and has been since TASK-423 (`rate`) / TASK-171 (`discount.actor`). **It is small to build (S), and I'd suggest it jumps the queue.**
⛔ Waiting on your ruling: the allow-list shape, CRM-only as written, or something else.

---

# 🔨 RULING — @Sober (2026-09-26): **the ALLOW-LIST, and it jumps the queue.** ▶️ Build. I have escalated the leak to @Porter for the owner.

**I verified your central claim myself before ruling, because it is the most serious thing found this round:** `src/index.ts:71` registers `publicCheckin`; `:84` registers `coachRateMask`. **Hono runs handlers in registration order, so the public handler answers before the mask exists.** ⇒ **the coach-rate mask — key 59, the whole point of TASK-431 — has never applied to these doors.** Confirmed, live, and it has been since `rate` landed.

## 🔴 What this actually is, stated plainly
**A parent holding a check-in link can read what we pay the coach**, and **an admin's username**, from a door that takes no login. Parents receive those links on LINE. **This is not the CRM ticket with more fields; it is a different and much more serious defect that the CRM ticket happened to walk into.**
📌 **And it is the lesson of the round, in its sharpest form: a guard that lives in middleware protects the routes it is registered in front of, and nothing tells you about the ones it is not.** We have spent two days on *one rule, two readers*. This is *one rule, and a reader the rule never reached* — and the reader is the public.
✅ **You stopped instead of removing the five CRM fields I asked for.** Doing what I asked would have closed the smallest hole in the set and left the coach's pay in place, **and my task would have been "done".** That is precisely why the instruction was *propose, do not build*.

## The ruling: **the allow-list, exactly as you propose**
- **One function, `toPublicCheckinBooking(dto)`, at the ONE place that produces the answer** (`checkinByToken`), so the token page, shop-front single and batch all inherit it — the batch by construction, as it relays the single body.
- 🔑 **An allow-list, not a deny-list, and your reasoning is the deciding argument:** the admin DTO has **33 keys and grows every round** (`rate` in TASK-423, `discount.actor` in TASK-171). **With a deny-list, every field anyone adds in future is public by default.** An allow-list inverts the default so a new field is private until someone decides a family should see it. **The `provenance` pattern is right for one field and wrong for thirty-three** — that distinction is yours and it is correct.
- **The shape as you drew it:** `date`, `startTime`, `endTime`, `student.name`, `subject.name`, `teacher.nickname`. **Every field the pages actually read survives, so the FE costs nothing** — narrow the contract type and **name it for @Fern rather than editing her repo.**
- ✅ **`crmAwarded` stays.** It is the rule's constant (+10), not the child's balance, and the page shows it to the family on purpose.
- **DUO unchanged:** one child's name, as today. Name it for Fern; do not change behaviour inside a leak fix.
- 🔑 **Pinned by KEY SET through the root app**, deep, **plus by-value absence of `rate`, `discount`, `note`, `course` and the CRM fields.** And 🔑 **add the one pin that would have caught this class: that no public route's answer can contain a coach-rate field** — the `COACH_RATE_FIELDS` list already exists; **assert it against the public doors' output**, so the mask's promise is checked where the mask does not run.
- 🚫 Nothing about what a check-in does, consumes or says changes. 💰 No money moves.

## Priority
**It jumps the queue — build it next.** TASK-497 is held on the owner and TASK-498's follow-ups can wait; **a live leak of a coach's pay to parents cannot.**

## 📌 Your Fern finding, passed on with this
`CampSuccessView` reads `day.studentName` and `day.weekName`, **which `dayDTO` never sends** — two lines that silently render nothing on the family's camp reply. **Noticing that while reading for a different reason is the habit that has found most of this round.** It goes to her inbox; it is not yours.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — the allow-list, built as ruled: every public check-in answer carries exactly the six fields the pages read. 3257 pass / 0 fail · tsc 0 · 59 = 59 · 5/5 mutations bite

**Numbers:** `bun test` **3257 pass / 0 fail**, twice (+8) · `tsc` **0** · **59 = 59**, no migration.

## What changed
- **`toPublicCheckinBooking(b)`** (`db/mappers.ts`, beside the admin DTO it replaces on public doors) is an **allow-list literal, with no spread**: `{ date, startTime, endTime, student: { name } | null, subject: { name } | null, teacher: { nickname } | null }`. The comment says why it is an allow-list and that a field becomes public only by being added there.
- **Applied at the ONE place that produces the answer, `checkinByToken`, at BOTH its return points** (fresh, and already checked in). So the token page, the shop-front single, the shop-front batch (it relays the single body) and the LINE path all get it. **`remaining` is still computed from the full booking first**, so the "7/10 sessions" line is unchanged.
- ✅ `crmAwarded` stays (+10, the rule's constant). **DUO unchanged:** the first child's name, as today (named for Fern below).
- 🚫 Nothing about what a check-in does, consumes or says changed. **No money moves.** The admin DTO is untouched.

## The pins (`src/services/public-checkin-shape-req108.test.ts`, 8 tests)
- **By KEY SET, deep, through the ROOT app, on all three doors:** the token page (fresh and already), the shop-front single, and the shop-front batch (per row). The helper records **every key present in the JSON, with `null` as a value of its own**, so **"null instead of absent" fails** (Fern's TASK-478 lesson).
- **By VALUE:** none of the leaked values appears anywhere in the four bodies (`45000`, `50000`, `admin-dong`, the staff note's text, `FREELANCE`, `leaveUsed`, `crmPoints`, `perks`, …).
- 🔑 **Key 59's promise, checked WHERE THE MASK DOES NOT RUN:** every key at every depth of the public answers is collected, and **none of `COACH_RATE_FIELDS`** (`rate`, `classRateMinor`, `teacherRates`, `rateMinor`, `teacherRateMinor`) may appear. This is the pin that would have caught this class. The walk is pinned non-vacuous.
- **The ADMIN DTO unchanged, by value:** `toBookingDTO` still carries `rate` (45000 / 45000 / 50000), `discount` **with its actor**, `note`, `course`, and the student's CRM fields, **33 keys**.
- **By source:** the public shape has no spread, both of `checkinByToken`'s answers use it, and neither returns a raw `booking`.
- **The fixture is the one that proved the leak**: a course row with a coach rate, an admin-attributed discount and a staff note, through the attend path returning a **real `toBookingDTO`**. So the test starts from the leaking object, not from a clean one.

## The other public routes, checked for the same class (Sober's lesson: "a reader the rule never reached")
Every route registered **before** the auth guard and the rate mask (`index.ts`): auth, webhooks, **`publicCheckin`**, **`publicCalendar`** (the ICS feed), **`publicRegister`** (LIFF), internal.
- **Only `publicCheckin` used an admin DTO builder.** `register.ts` answers `{ ok, linked, phone, childCount, … }`, the ICS feed renders text (no rate, discount or CRM in `ics.ts` / `calendar.service.ts`), and webhooks, internal and auth return no booking or course DTOs.
- 📌 **The allow-list is what fixes this door; a future public door needs its own.** A general guard (for example, the `COACH_RATE_FIELDS` walk applied to every route registered before the mask) would be its own small task, if you want the class closed rather than this instance.

## For @Fern (named, not edited: her repo)
1. **Narrow the contract type:** the public check-in answer's `booking` is now exactly `{ date, startTime, endTime, student: { name } | null, subject: { name } | null, teacher: { nickname } | null }`. `SuccessView` reads only these, so no screen changes.
2. **DUO:** the page shows `student.name` only, one child of two. It is unchanged here on purpose (no behaviour change inside a leak fix). If the page should read both, the BE would add `displayName` to the allow-list: one line, your call with her.
3. (Already passed on by you) the camp page reads `day.studentName` / `day.weekName`, which `dayDTO` never sends.

## Break-and-watch: `mut499.mjs`, 5 mutations, **5 bite**
`BASELINE=55` (this file + the moved pin's file + both shop-front files), read off a real run.
- ⚠️ **Honest note:** my first run passed `BASELINE=61`, a wrong number. Every mutation still bit with **real failures** (1–6 each), so no bite came from the baseline, but I re-ran with the correct 55 for a clean record. Same results.

`finally` + sha-256 restore, byte-identical. **CHECKSUM `d81badc1…` identical before and after.**
- **A — the CRM fields returned as `null` instead of absent**: **bites, 5 fail** (by key set).
- **B — the CRM fields stripped from an ADMIN read**: **bites, 1 fail** (the admin pin).
- **C — a DENY-list instead** (rate, discount and note removed; CRM and course ride along): **bites, 6 fail**.
- **D — ONE answer left unshaped** (already checked in ⇒ the full admin DTO): **bites, 3 fail**.
- **E — the coach's rate added back to the public shape**: **bites, 6 fail** (including the `COACH_RATE_FIELDS` walk).

## Moved pin
`camp-day-rate-req104` pinned the old `booking: result.booking` return line. It now pins `booking: toPublicCheckinBooking(result.booking)`, with a comment that `remaining` still reads the full booking.
⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26) — the leak is closed
Re-run by me: **3257 pass / 0 fail** (four clean runs; see the note below about the fifth) · tsc 0 · 59 = 59 · `toPublicCheckinBooking` applied at **both** of `checkinByToken`'s return points, read by me at `checkin.service.ts:97` and `:129`.

✅ **An allow-list LITERAL with no spread.** That is the detail that makes it true rather than intended: a spread with deletions would have re-admitted every field added in future, which is the exact failure mode the ruling was chosen to prevent. **The shape enforces the rule; nobody has to remember it.**
✅ **Applied at both return points**, so the "already" path and the successful path are equally narrow — and the shop-front, the batch and LINE inherit it because they relay this body. One place, four doors.
🔑 **`COACH_RATE_FIELDS` walked over every public answer — the pin I most wanted.** It checks the mask's promise **exactly where the mask does not run**, which is the only place the promise was ever broken.
✅ **The admin DTO pinned unchanged by value (33 keys, `rate` and `discount.actor` still present).** A leak fix that quietly narrowed the admin's own view would have been a second defect wearing the first one's clothes.
✅ **He checked the OTHER pre-mask routes** — register and the ICS feed — and found only `publicCheckin` used an admin DTO. **That is the difference between fixing the instance and knowing the size of the class.**

📌 **And he reported his own BASELINE mistake again** (61 against a 55-test set), noting every bite was a real failure regardless. **Twice now he has volunteered that**, and it is the reason I can read his mutation counts as evidence rather than decoration.

## ▶️ Two things this produced, both cut
- **TASK-501** — his offer: a guard that **no route registered before the mask can answer with a coach-rate field**. Accepted. **This closes the class rather than the instance**, and the class is the thing that got us here.
- **TASK-500** — 🔴 **the intermittent failure has RECURRED, on my machine.** One of my runs came back **3256 pass / 1 fail** before four clean ones. In TASK-488 I wrote *"noted, owned by nobody, until it recurs."* **It has recurred, so it now has an owner.**
