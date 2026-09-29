# TASK-481 — the check-in provenance is stored and read by NOBODY: put `checkinSource` in the roster/booking DTO — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size XS.** No migration (0056 already has the column). **After TASK-480.** Rides this `uat` release. Pairs with TASK-482 (FE).

## §0 Why this is not cosmetic, and why it rides THIS release
Tanya's TEST-073: `bookings.checkin_source` is written on every path and **surfaced nowhere** — no DTO, no screen. I promised the owner that "an admin can see at a glance that a check-in came from the wall QR", and that promise is the **only safety net we shipped for the gap the owner accepted in REQ-108 §5**: a family with **no linked LINE gets no notice**, so if someone else's phone number is used at the counter, the provenance on the record is the sole evidence that will ever exist. A column nobody can read is not evidence.
📌 **Written but unread is the same failure shape as TASK-474's token:** the feature looks implemented and does nothing. That is the third time this month, so I am cutting it as work rather than as a note.

## §1 Build
- The **session roster / booking detail** DTO carries `checkinSource` — the raw stored value, unchanged (`shopfront-qr` · `checkin-qr` · `end-of-day` · `staff`/null). 🚫 **Do not translate it here.** The words a human reads belong on the screen (TASK-482); a DTO that ships a Thai sentence cannot be filtered, counted or reused.
- **Say which DTOs you touched and why those.** If the roster and the detail are two builders, both — a chip that appears on one screen and not the other is the same invisibility in a smaller box.
- 🔑 **Camp:** `markDay` already records the same provenance (`marked_by`). **Check whether the camp day DTO surfaces it.** If it does not, add it the same way and say so; if it does, name where. Camp is exactly where the wall QR is most used.
- **By value:** a booking attended from the shop QR ⇒ `checkinSource: "shopfront-qr"` on the read; one attended by staff ⇒ whatever is stored (incl. `null`), **not** a default word invented in the DTO; the day-end's `end-of-day` rides through unchanged.
- 🚫 No change to what any path WRITES, to masking, or to RBAC. ⚠️ If `checkinSource` would be visible to a **scoped teacher**, say so and stop — the coach-rate mask's rule is that we decide what a coach sees deliberately, and I want to rule on it rather than discover it.

## Definition of Done
- [ ] `checkinSource` on the roster and detail reads, raw and untranslated · the DTOs named · camp checked and stated · the teacher-scope question answered · by value incl. `null` and `end-of-day` · suite **count** · tsc 0 · 57 = 57 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that defaults the field to a word · report here + `inbox/SA.md` + log.

---

# ⏸️ STOPPED AS INSTRUCTED — @Jason → @Sober (2026-09-25) — YES, it would reach a scoped teacher; your ruling first. NO code written.

## §1 🔴 The teacher-scope answer: YES
- **ONE builder serves every booking read:** `toBookingDTO` (`db/mappers.ts:174`). It is behind the calendar list (`getCalendar`, `scheduler.service.ts:543`), the booking detail (`:457`), `getBookings` (`:564`), the check-in scan's `loadBooking`, and pause/resume. A field added there appears on **every** read at once.
- **A scoped (linked) teacher reads it on two routes:**
  - `GET /calendar`: `getCalendar(…, viewerOf(c))`, scoped to their own rows, **with a viewer mask** that today covers budget figures (TASK-426);
  - `GET /bookings`: `getBookings(…, scopeOf(user))`, scoped, **with no viewer mask at all**.
- ⇒ `checkinSource` added to `toBookingDTO` would reach a coach on their **own** classes. ⚠️ And what it would show is not only `shopfront-qr` / `line` / `end-of-day`: **a staff attend stores `actorOf(c)`, the staff member's USERNAME** (TASK-475: `updateBookingStatus(…, actorOf(c))`). So a coach would read which admin account marked their class.
  - (A small correction to the task's list: the stored values are `shopfront-qr` · `checkin-qr` · `line` · `end-of-day` · **a username** · `null` for every attend written before 0056. There is no literal `staff` value.)

## §2 Options, for your ruling
- **A. Everyone sees the raw value.** Simplest; a coach sees usernames on their own classes.
- **B. Masked for a scoped viewer** (`null` for a linked teacher), like the budget figures. The calendar already has `viewerOf`; **`GET /bookings` would need the viewer threaded in** (today it takes only the scope). That is one more argument, and a place the mask can't be forgotten if it lives in one helper both routes call.
- **C. Coarse for a scoped viewer:** a coach sees `shopfront-qr` / `checkin-qr` / `line` / `end-of-day`, and a username becomes `staff`; admins see the raw value. It's more useful to a coach, but it invents a word in the DTO, which the task forbade for admins, so it would need saying.
- **My recommendation: B.** The owner's need is the admin's ("see at a glance that it came from the wall QR"); a coach has no stated need; and a username is exactly the kind of thing the coach-rate rule says we decide deliberately. B also keeps the admin's value raw and untranslated, as the task wants.

## §3 The other answers, so you can rule once
- **DTOs to touch (after your ruling):** `toBookingDTO` only. That covers roster, calendar and detail at once, so a chip cannot appear on one screen and not the other. Plus the mask per your ruling, on the two scoped routes.
- **Camp: `marked_by` is surfaced NOWHERE today.** Not `dayDTO` (`camp.service.ts`, the scan's answer), not `toPackageDTO`'s `days[]` (the package/roster read), not the day-editor DTO. It carries the same kind of values: `checkin-qr` · `shopfront-qr` · `end-of-day` · a staff username (`markDay(…, actor)`). The same scope question applies to whoever can read camp packages (`menu:camp`; TASK-463 already showed that path reaching a `menu:camp` user without key 59). So the ruling should cover camp's `markedBy` too.
- **The mutation you asked for** (defaulting the field to a word) is planned, and so is `null` passing through as `null`.

⏸️ **Waiting on your A / B / C, for sessions and for camp.** TASK-480 is done and reported; nothing else is waiting for BE.

---

# 🔨 RULING — @Sober (2026-09-25), on Jason's stop: **B. `null` for a scoped viewer. Same for camp's `marked_by`.** ▶️ Resume.

**Stopping was right and the finding is bigger than the question I asked.** I asked "would a coach see this?" expecting a yes/no about a channel name. The answer is that **the column does not hold a channel at all for a staff attend — it holds the ADMIN'S USERNAME** (`actorOf(c)`). So the honest version of my question is: *would a coach see which admin account marked their class?* Put that way it answers itself.

## The ruling
- **B — a scoped viewer reads `checkinSource: null`**, threaded through `GET /bookings` as well as `/calendar`. Not C. Coarsening a username to `staff` would mean **the DTO deciding what a coach deserves to know, case by case**, and every new source value would re-open that decision in a place nobody looks. `null` is one rule, it is the same rule a coach already lives under for money, and it costs the chip nothing: **TASK-482 renders only `shopfront-qr`, and a coach has no use for provenance on their own class.**
- **Camp's `marked_by`: the same rule, surfaced the same way** — it is unsurfaced today, it carries the same values, and I am not leaving two provenance fields under two different rules for a future reader to discover the hard way.
- 🚫 Still no translation in the DTO, and 🚫 no change to what anything writes.

## 📌 The real defect, recorded and NOT fixed in this release
**`checkin_source` holds two different kinds of fact in one column: a CHANNEL (`shopfront-qr`, `checkin-qr`, `end-of-day`) and a PERSON (an admin username).** That is why a simple "show the provenance" task turned into a privacy question — the two truths have different audiences, and any rule about one is wrong for the other. The right shape is a channel column plus an actor column.
⚠️ **Not now.** It is a migration and a rewrite of every writer, on the day of a release the customer has already postered. **Next round, with Undo + DUO + multi-select** — and Undo is the right moment anyway, because the owner asked it to record "who and when" while keeping the original check-in's provenance, which is exactly the two columns.

## Definition of Done — amended
- [ ] Everything in §1 above · **B: a scoped viewer reads `null`** on `GET /bookings` **and** `/calendar`, by value, pinned · **camp's `marked_by` surfaced under the same rule**, by value · 🔑 a mutation that hands a scoped viewer the raw value (and one that hands them a coarsened word — B is not C) · the rest of the original Definition of Done unchanged.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-26) — ruling B built, sessions and camp; OPT-IN so every other read hides it; 3120 pass / 0 fail; 7/7 mutations bite

**Numbers:** `bun test` **3120 pass / 0 fail** (+7; new `src/services/checkin-source-visibility-req108.test.ts`) · `tsc` **0** · **57 = 57** · 🚫 no change to what anything WRITES, to masking elsewhere, or to RBAC.

## §1 The shape: OPT-IN, and why
- **`toBookingDTO` carries `checkinSource`, which is `null` unless the caller passes `provenance: true`.** Exactly three reads opt in, each as `provenance: !scope`: the **calendar grid**, the **cancelled tray** (both in `getCalendar`, whose scope comes from the viewer) and the **booking list** (`getBookings`, whose scope comes from `scopeOf(user)` on the route). An admin reads the RAW value; a scoped teacher reads `null` on both `/calendar` and `/bookings` (ruling B).
- 🔴 **Why opt-in rather than "raw unless scoped":** the same builder serves the **PUBLIC** check-in scan (`loadBooking` → the "already" answer) and every mutation's response. With a raw default, **a parent re-scanning a link would have been handed the admin's username** that marked the class. Opt-in means a read added later hides it until someone decides otherwise. Pinned by value (the public "already" answer carries `null`), and **pinned that nothing else opts in**: a scan of `src` lists every `provenance:` and expects exactly those four sites.
- There is no GET-one-booking route: the detail modal opens on the calendar's own DTO (TASK-366), so the grid covers "roster and detail" together.
- **Camp: `markedBy` is now surfaced** on the package read's `days[]` (`GET /api/camp/packages` → `listPackages`) under the **same rule**, keyed on `!scopeOf(c.get("user"))` in the route. It is `null` on every other package response (redeem, mark, and the public scan's credit).
- **Raw, never translated:** `shopfront-qr` · `checkin-qr` · `line` · `end-of-day` · a username · `null` all ride through unchanged, by value. A pre-0056 row reads `null`, not an invented word.

## §2 For @Fern (TASK-482)
- Sessions: `checkinSource` on every item of `GET /api/calendar` (grid and `cancelled[]`) and `GET /api/bookings`.
- Camp: `packages[].days[].markedBy` on `GET /api/camp/packages`.
- Both are `null` for a linked-teacher account. The chip renders `shopfront-qr` only (your ruling), so nothing else needs words.

## §3 One honest limit, stated
**The ruling is tested by value where the value is MADE** (`toBookingDTO` both ways, `listPackages` both ways, the public scan). **The routes are pinned by source** (`provenance: !scope` at each of the three calls; the scope's origin on each route). I did not drive `getCalendar` / `getBookings` end-to-end with a scoped user: both are large hand-built queries (every existing test of them is by source for the same reason), and faking them whole would mostly test the fake. The mutations that hand a scoped viewer the raw value on each route bite.

## Break-and-watch: `mut481.mjs`, 7 mutations, **7 bite**
Every bite shows real failing tests. `finally` + sha-256 restore, byte-identical each time. CHECKSUM over `git diff` + untracked files, `52127f18…`, identical before and after. `BASELINE=19` read off a real run.
- A 🔴 **a scoped viewer handed the RAW value** (the list)
- B 🔴 **a scoped viewer handed a COARSENED word** (C, not B)
- C 🔴 **the field defaulted to a word**
- D the calendar grid ignores the scope
- E 🔴 camp's read hands a scoped viewer the raw `markedBy`
- F camp's `markedBy` never surfaced
- G 🔴 the session provenance never surfaced (the original defect)

📌 **Your two-columns note (channel vs person) is recorded as next round's.** Nothing here pre-empts it.
⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Re-run by me, twice: **3120 pass / 0 fail** both times · tsc 0 · 57 = 57 · `db/mappers.ts:182` gates the field on `opts.provenance` and **defaults to `null`**; exactly three production calls opt in, each `provenance: !scope`.

🔴 **The find is his, and my ruling did not cover it: the same builder answers the PUBLIC scan.** I ruled on "would a coach see this?" — he asked *who else reads this builder* and found the parent. A raw default would have put **the admin's username into a parent's check-in reply**, on a page reached from a QR code on a wall. That is a worse leak than the one the task existed to prevent, and it was one default away.
📌 **This is the same move as TASK-474's token and TASK-479's English chat, three tasks running:** the defect was never in the thing the task named, it was in *what else stands between this value and a person*. A ruling is a decision about a case; it is not a survey of the callers, and I should stop writing rulings as if it were.
**Making it OPT-IN rather than opt-out is the right shape** — a new read of this builder is `null` until someone deliberately asks, so the next caller is safe by default rather than safe by review. That is the difference between a rule enforced by structure and a rule enforced by whoever reads the diff.

**The ruling is built as given:** raw for an admin, `null` for a scoped teacher, camp's `markedBy` under the same rule, values passing through unchanged including a username and `null` — **never a default word** (mutation C). Mutations A and B are the two ways to get B wrong (raw, and coarsened-to-C) and both bite.

📌 **§3's limit is stated honestly and I accept it.** The rule is tested by value where the value is made, and the two large hand-built reads are pinned by source — as every existing test of them is. His reason is the right one: faking those queries whole would mostly test the fake. **A limit named in the report is worth more than a test that proves nothing**, and the route mutations still bite.
