# TASK-870 — BE + FE: REQ-5008 **a voucher counts the sessions already booked; check-in on an empty voucher is REFUSED** (ขวัญ "B", 11-08) — @Bob (BE, smart-scheduler-back ≈ 1 d) + @Fanta (FE, smart-scheduler-front ≈ 0.5 d) — HIGH
**From @Silver, 2026-11-08.** Customer defect, HIGH. Owner: *"ทำอย่างอื่นรอไปก่อนได้ไหม"*. Finding: `CHECK-REQ-5008-voucher-quota-2026-11-08.md`. Tanya reproduced the booking half on sid (3 booked + confirmed with 1 h left, no refusal, no warning), and the uat facts match ขวัญ (REQ-5008 § Tanya's interim). Branch `dong`. **No git command: git only on the owner's word.**
**Order:**
- **Bob:** right after TASK-861 BE closes, **before TASK-863**. Same tree, and it rides the same SB sid deploy.
- **Fanta:** after TASK-861's FE live check. Pause TASK-862 for it: it's ≈ 0.5 d.

## The rule
- **At booking:** a voucher session can be booked only if **`total_hours − used_hours − reserved ≥ 1`**.
  - `reserved` = this voucher's bookings that a later deduction can still turn into ATTENDED, i.e. not yet deducted, not cancelled and not on leave. By my read that's `PENDING` and `CONFIRMED`.
  - **Bob: confirm the exact status set against every deduction path** (manual attend `scheduler.service.ts:~4592`, day-end auto-attend `jobs.service.ts:~110`, the attendance revert `attendance-revert.service.ts:41`), and list it in your report.
- **At check-in on a voucher with nothing left** (`used_hours ≥ total_hours` before this deduction):
  - **🔴 RULED 2026-11-08: REFUSE** (ขวัญ, verbatim "B ka", LINE 3:43 PM; REQ-5008 § Khwan's ruling): 409 `VOUCHER_EXHAUSTED`, **nothing deducted, nothing written**.
  - WARN stays available only as the other value of the switch: the deduction happens and the response carries `voucherWarning`.
  - The switch is **one exported constant** in `src/lib/voucher.ts`, `VOUCHER_EMPTY_CHECKIN: "WARN" | "REFUSE" = "REFUSE"`. Flipping it = one line + a deploy. No DB setting, no UI.
  - With the booking gate in place, this can only hit vouchers that were over-booked before the fix (today on uat: `fe7fa6ff…`'s extra 2 sessions; `CHECK-REQ-5008` § RESULT).
  - **The day-end auto-attend never refuses** (a refused row would stay unsettled). It deducts, as today.
- **Words:** reuse the existing approved «ชั่วโมงในวอยเชอร์หมดแล้ว» (`lib/voucher.ts:40`) for both the booking refusal and the check-in warning / refusal. **No new words.**

## Bob: BE (`smart-scheduler-back`)
1. **`voucherUsable`** (`lib/voucher.ts:38`) takes `reserved` (default 0 for old callers). `voucherRemaining` stays `max(0, total − used)` for display, and a new `voucherAvailable(v, reserved)` = `total − used − reserved` is used by the gate.
   - `voucherStatus` → `EXHAUSTED` when available ≤ 0 **and** nothing is reserved? **No:** keep `voucherStatus` as is (used-based), so the SOM / list statuses don't shift meaning. Only the booking gate and the picker change. *(SA decision; it keeps this TASK out of the SOM numbers.)*
2. **`prepareVoucherBooking`** (`scheduler.service.ts:1403`): count `reserved` inside the same tx, with one indexed count on `bookings.voucher_id` + status, then gate.
   - **Moves / reschedules / teacher changes of an existing voucher booking don't go through this function.** Prove with a test that moving a booked session on a full voucher is NOT refused.
3. **The DTO:** the voucher summary (`scheduler.service.ts:~2820`, `hoursRemaining`) and the voucher list / picker DTO gain **`hoursReserved`** and **`hoursAvailable`** (additive; `src/types/contract.ts`).
4. **Check-in, the manual attend and the parent check-in (`checkin.service.ts`):** when the voucher was already empty before this deduction:
   - REFUSE mode (**the default**): 409 `VOUCHER_EXHAUSTED` with the reused sentence as the message, before any write (no `used_hours` change, no status change, no attendance row);
   - WARN mode (the switch's other value): return `voucherWarning: "<the reused sentence>"` in the response.
5. **No migration.**

**Tests** (SAFE env; each must fail when its code is removed):
1. 1 h left + 0 reserved → booking OK; 1 h left + 1 reserved → refused with the sentence;
2. a CANCELLED / leave row doesn't reserve;
3. moving a booked session on a full voucher is not refused;
4. check-in on an empty voucher: **the default (REFUSE) → 409 with nothing written** (assert `used_hours` and the booking's status unchanged), on the manual attend AND the `checkin.service.ts` path; WARN mode (constant overridden in the test) deducts + warns;
4b. the constant's exported default is `"REFUSE"` (a test pins it, so a stray flip back fails);
5. day-end on an empty voucher still deducts;
6. the DTO's `hoursReserved` / `hoursAvailable`.

## Fanta: FE (`smart-scheduler-front`)
- **The voucher picker** in the booking form: show and gate on **`hoursAvailable`** (not `hoursRemaining`).
  - A voucher with 0 available can't be picked for a new session.
  - Reuse the existing remaining label pattern; no new words. If the label must say "booked", stop and tell me.
- **The admin's attend / check-in action:** on 409 `VOUCHER_EXHAUSTED` (the default now), show the server's sentence in the existing error toast style, and the row stays un-attended. Keep a `voucherWarning` notice too (cheap; it covers the switch's other value).
- **The parent's LIFF check-in page:** no code change planned, but REFUSE now reaches it (a parent's check-in on an empty voucher gets the 409). **Read what that page shows for a 409 with a message and report it.** If it shows the server's sentence, fine. If it shows a generic error or nothing, stop and tell me; that's a wording question for Porter, not yours to fix.
- **Tests:** the picker gates on `hoursAvailable`; the 409 shows the sentence; the warning shows.
- **Then the live check on a local SB** (host check first = sid .206; `B-` data): a 1-hour-left voucher refuses the 2nd booking, and an empty one is **refused on attend** with the sentence and nothing deducted.

## Not code: the vouchers already over-booked (staff list)
Porter takes this as a read-only DATA REQUEST on uat: the bare SQL is in `CHECK-REQ-5008-voucher-quota-2026-11-08.md` § "Over-booked list". No engineer runs it.

## Files (claim, Team B)
- **Bob:** `src/lib/voucher.ts`, `prepareVoucherBooking` + the voucher summary / list DTO + the attend hunk in `scheduler.service.ts`, `src/services/checkin.service.ts` (the voucher deduction only), `src/types/contract.ts`, tests.
- **Fanta:** the voucher picker component(s), the attend action's toast, the mapper / types for the two new fields, tests.
- **Pure mirror test edits are pre-approved** (tagged `🔻 TASK-870`, listed).
- **Shared-file note:** `scheduler.service.ts` is also Team A's and Team C's. Small hunks, inside the named functions.

## Done =
- **BE:** `tsc` 0 · SAFE suite green (before / after) · a mutation set over the gate + the check-in switch.
- **FE:** `tsc` 0 · the front's tests green · build 0 · the live check with screenshots in `tests/evidence/task-870/`.
- **Both:** report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run. **Rides the next SB / SF sid deploy:** I'll say deploy-safe.

## Review — FE half (Silver, 2026-11-08)
✅ **Accepted on code.** The live check is still owed and waits on Bob's 861 + 870 BE.
- **Re-run:**
  - SF `bunx --package typescript@5.9.3 tsc --noEmit` = 0;
  - `bun test` = 1426 pass / 0 fail. That's higher than Fanta's 1416; the extra are other seats' new tests in the same tree, none failing.
- **Read:** `lib/scheduler/attend-outcome.ts`:
  - the server's sentence is shown unchanged;
  - the only words are 2 existing approved titles;
  - a refusal keeps the modal open and the row un-attended.
- **The picker gate:** `hoursAvailable ?? remainingHours`. An older payload keeps today's behaviour, so the front can ship before or with the BE.
- **Rulings:**
  1. The refusal title `plan.genericError` is **OK**: an existing approved string, no new words.
  2. **The อื่นๆ form's "deduct from a voucher" list:** leave it as is in this TASK. Whether an OTHER row that deducts a voucher must also pass the reserved-hours gate is a BE question first. **Bob: say in your 870 report whether `prepareVoucherBooking` covers that OTHER path.** If it doesn't, it becomes a follow-up, not a change here.
  3. **LIFF:** the parent sees the server's sentence under the generic failure title, with a Retry that refuses again. Passed to Porter as a wording question (no code here).
- **Shared files:** Fanta's SF hunks don't touch CreatePlanFlow / PlanModal / VoucherPanel, so Team C's F2 SF hunks are free to go.

## Amendment — the parent's LINE check-in refusal (Porter's PM decision 2026-11-08, small UI, free per the owner 11-08) — @Fanta
**Scope:** `src/components/partials/Checkin/CheckinContent.tsx` + its two dictionary entries + a test. **Only when the refusal's code is `VOUCHER_EXHAUSTED`.** Every other check-in failure stays exactly as it is, Retry included.
- **The code is already carried:** `CheckinContent.tsx:67` keeps `data.error.code`, and `ErrorView` (`:198`) already branches on a code (`CAMP_TOKEN_EXPIRED`). Add one more branch the same way.
- **Title:** «วอยเชอร์หมดแล้ว», as a new key `checkin.voucherEmptyTitle`.
- **Text:** «ชั่วโมงในวอยเชอร์หมดแล้ว กรุณาติดต่อแอดมินเพื่อซื้อเพิ่ม», as a new key `checkin.voucherEmptyBody`. **Use this text, not the server's message,** so the parent always reads the full sentence.
- **No Retry button:** retrying can never pass. Instead, show the existing `checkin.closeHint` line («ปิดหน้านี้ได้เลย»). *Interpreted:* that's Porter's "single close/OK", using an existing string and adding no new button. LINE's own ✕ closes the page.
- **English entries:**
  - Use the Thai text in the `en` dictionary too, until Porter gives the English pair (I've asked him).
  - Mark both entries `// TASK-870: en pending Porter`.
- **Test:** a 409 with `error.code = "VOUCHER_EXHAUSTED"` shows the new title + body, the close hint and **no Retry**. A different 409 still shows `failTitle` + Retry. Each must fail when its branch is removed.
- **Bob:** the check-in 409 body must carry `error.code = "VOUCHER_EXHAUSTED"`. Say in your report that it does, with the line.

### Amendment: English pair (Porter, 2026-11-08). Replaces "en pending"
- `checkin.voucherEmptyTitle` (en): **"Voucher used up"**
- `checkin.voucherEmptyBody` (en): **"This voucher has no hours left. Please contact the admin to buy more."**
- Porter has confirmed that «ปิดหน้านี้ได้เลย» with no new button is fine. Drop the `// TASK-870: en pending Porter` markers.

## BE report (Bob, 2026-11-08) — DONE-pending-review, no migration, nothing committed
- **The rule** (`src/lib/voucher.ts`): `VOUCHER_EMPTY_CHECKIN: "WARN" | "REFUSE" = "REFUSE"` (one constant; **default pinned by a test**), `VOUCHER_EMPTY_MESSAGE` = the approved «ชั่วโมงในวอยเชอร์หมดแล้ว» (no new words), `voucherAvailable(v, reserved)` = total − used − reserved, `voucherUsable(v, date, reserved = 0)`, `emptyVoucherCheckin(v, mode = VOUCHER_EMPTY_CHECKIN)` (mode injectable only so BOTH values are tested). `voucherStatus` / `voucherRemaining` are UNCHANGED (used-based), so the SOM / list statuses do not shift.
- **Reserving statuses (checked against every deduction path):** `PENDING · CONFIRMED · EXTENDED` — the ONE live set `COURSE_LIVE_STATUSES`, not a second list. The deduction paths: the manual attend (`updateBookingStatus` "attend", any status ≠ ATTENDED, after `assertNoCoachOnLeave`), the day-end (CONFIRMED only, `jobs.service.ts` auto-attend), the attendance revert (`attendance-revert.service.ts:41`, ATTENDED → CONFIRMED: the row becomes live again and reserves again). SICK_LEAVE · PAUSED · CANCELLED · NO_SHOW · ATTENDED reserve nothing (a leave returns the hour; a paused row holds a slot only; delivered rows are already in used_hours). EXTENDED is included although a voucher rarely has one: it is live and can be attended.
- **Booking gate:** `prepareVoucherBooking` counts the voucher's live bookings in the same executor (one `findMany` on `voucher_id` + the live statuses, JS-filtered again) and gates on `voucherUsable(…, reserved)`. Moves / reschedules / teacher changes never call it (the ONE call site is the create path, inside `bookingType === "VOUCHER"`) — pinned by source; a booked session on a full voucher can still be moved.
- **The อื่นๆ question (Silver's ruling 2): `prepareVoucherBooking` does NOT cover an OTHER row.** It is called only for `bookingType === "VOUCHER"`. An OTHER row that carries a `voucherId` is not gated at booking; when it is ATTENDED it goes through the same attend door, so the check-in gate below DOES apply to it at attend time. A booking-time reserved gate for OTHER would be a follow-up, not part of this TASK.
- **Check-in gate:** one door — `updateBookingStatus` "attend" (`scheduler.service.ts:4583`) — serves the manual attend AND every check-in path (`checkin.service.ts:126` calls it), so there is no second gate. Used ≥ total before the deduction ⇒ `throw conflict("VOUCHER_EXHAUSTED", VOUCHER_EMPTY_MESSAGE)` before the status write: 409, nothing written. **The 409 body carries `error.code = "VOUCHER_EXHAUSTED"`** (`errorEnvelope`: `{ error: { code, message } }`, `lib/http.ts:32`). WARN mode: the deduction happens and the response gains `voucherWarning`. The day-end auto-attend has no gate (pinned: its source has no `emptyVoucherCheckin` / `VOUCHER_EXHAUSTED`).
- **DTO:** `hoursReserved` + `hoursAvailable` (additive, `types/contract.ts`) on the voucher DTO (list/picker: the live bookings ride the SAME read via a new `vouchers.bookings` relation — no extra query) and on the voucher plan summary. A single-row write (create / expiry change / cancel responses) reads 0 reserved.
- **Tests:** `voucher-reserved-hours-task870.test.ts` 19 pass; `voucher-reserved-hours-task870.mutations.json` 26 mutants, all bite; every other set in the tree re-run, no survivors. Full SAFE `bun test` 5412 → **5435 pass · 0 fail**; tsc 0.
- **Mirror edit (pre-approved kind, tagged 🔻 TASK-870):** `voucher-recount-yields-task569.test.ts` — its fake executor gains `bookings.findMany` (the reserved count).
- **Not code:** the over-booked staff list is Porter's read-only DATA REQUEST (bare SQL in the CHECK file). **Deploy-safe for SB:** no migration; additive fields; with the front's `hoursAvailable ?? remainingHours` fallback either order is safe.

## Review — BE half (@Bob) — @Silver, 2026-11-08: ✅ ACCEPTED (DONE)
- **Re-run by me:** SB `bunx --package typescript@5.9.3 tsc --noEmit` = 0; SAFE `bun test` = **5435 pass / 0 fail** (5412 after 861, so +23).
- **Read `scheduler.service.ts:4578–4584`:**
  - the refusal is thrown **before** the status update and the deduction, inside the transaction, so nothing is written;
  - `VOUCHER_EMPTY_CHECKIN = "REFUSE"` (`lib/voucher.ts:43`);
  - reserving statuses = `COURSE_LIVE_STATUSES` (`:47`), one set shared with the course rules;
  - `checkin.service.ts` goes through the same door, and the 409 carries `error.code = "VOUCHER_EXHAUSTED"`, which is what Fanta's LINE branch needs.
- **The OTHER-with-voucher path:** not gated at booking (`prepareVoucherBooking` is VOUCHER-only), but it **is** refused at attend.
  - Ruled a **follow-up, not this TASK**. Her case was the voucher booking. Raised to Porter; built only if he asks.
- **Known limit (written, not fixed):** two check-ins on the same last hour at the same instant both read "1 left" before either writes. The deduction itself is atomic (`sql +1`), but the gate reads first. It's rare (one child, one hour), and the reserved-hours booking gate makes it rarer still.
- **Security review:** none. It only adds a refusal and one optional response field.
- **Live check (Fanta, with 861):** still owed.

## Amendment 2 — the อื่นๆ (OTHER) booking that deducts a voucher gets the same booking gate (Porter: YES, a bug fix, 2026-11-08) — @Bob, ≈ 0.5 d, right now, before TASK-877
- **Where:** `scheduler.service.ts:1554`. Today the gate runs only when `input.bookingType === "VOUCHER" && input.voucherId`. Make it run for **any** booking that carries a `voucherId`: VOUCHER **and** OTHER. Same function `prepareVoucherBooking`, same refusal, same sentence. No new words.
- **Check and report:**
  1. Can an OTHER booking carry a `voucherId` with **no student**? If it can, `prepareVoucherBooking`'s "belongs to the child" check gets `null`. Refuse that case with the existing validation error, or show it can't happen (the line).
  2. **Every other door that writes an OTHER row with a voucher:** the OTHER series creator (`other-series.service.ts`), edit / move of an OTHER row that changes its voucher, a group or a seat. List each one with a yes or no, and gate each one that can **add** a voucher draw. A move that keeps the same voucher must NOT be refused (the same rule as the voucher booking).
  3. Does an OTHER row with a voucher count in `reserved`? It must: one reserved-hours count, whatever the booking type. Show the count's `where`.
- **Tests (each must fail when its code is removed):**
  - an OTHER booking with a voucher at 1 h left + 1 reserved → refused with the sentence;
  - at 1 left + 0 reserved → OK;
  - an OTHER booking with a voucher reserves an hour for the next VOUCHER booking;
  - moving an OTHER row on a full voucher → not refused.
  - Add them to the 870 mutation set.
- **Files:** inside 870's claim (`scheduler.service.ts`, plus `other-series.service.ts` if item 2 says so). Same report place (this TASK). **It rides the same SB sid deploy.**
- **Team C** is now writing F2 hunks in `scheduler.service.ts` (sale paths). Keep this hunk to the gate line and what it needs, and stop and tell me if you meet their lines.

## BE report — Amendment 2 (Bob, 2026-11-08) — DONE-pending-review, no migration, nothing committed
- **The change:** `scheduler.service.ts` (createBooking, the gate line) now reads `if (input.voucherId) { await prepareVoucherBooking(...) }` — the gate runs for ANY booking that carries a `voucherId` (a VOUCHER booking and an อื่นๆ one that deducts a voucher), not by booking type: the attend draws on `booking.voucherId` whatever the type. Same function, same refusal, same sentence; no new words.
- **Check 1 — can an OTHER booking carry a `voucherId` with no student?** Yes: `createBooking`'s schema takes `voucherId` optional on every type and `student` optional on OTHER. Then `studentId` is null at the gate and `prepareVoucherBooking`'s existing «วอยเชอร์นี้ไม่ใช่ของนักเรียนที่เลือก» check (`v.studentId !== studentId`, `scheduler.service.ts:1409`) refuses it with the existing 400 sentence — pinned by value (a null student is refused). No new validation.
- **Check 2 — every door that writes an OTHER row with a voucher:** (a) `createBooking` → **gated now**; (b) the OTHER series creator / add-date (`other-series.service.ts:389`): **no** — it calls `insertBooking` with no `voucherId`, so it adds no draw (the file has no `voucherId` at all; pinned); (c) edit / move / swap / resume of an OTHER row: **no** — no `.set({…})` in the service writes `voucher_id`; the ONE writer of the column is the inserter (`voucherId: input.voucherId ?? null`, `:1358`, pinned as exactly one), so a move on a full voucher is never refused; (d) a group or a seat: no voucher draw (a seat is a COURSE_PACKAGE row under a group; a walk-in seat is a SINGLE_SESSION).
- **Check 3 — does an OTHER row with a voucher count in `reserved`?** Yes. The count's `where` is `and(eq(b.voucherId, voucherId), inArray(b.status, [...VOUCHER_RESERVING_STATUSES]))` (`scheduler.service.ts:1440`): voucher id + the live statuses, **no booking-type filter** (pinned: the function body has no `bookingType`).
- **Tests (added to the 870 suite, now 23 pass):** OTHER+voucher at 1 left + 1 reserved ⇒ refused with the sentence; 1 left + 0 reserved ⇒ OK; the reserved count has no type filter (an OTHER reserves for the next VOUCHER booking); the null-student case; the no-other-door pins (series creator has no `voucherId`; one writer of the column). **870 mutation set: 31 mutants (A1–A5 new), all bite.** Full SAFE `bun test` 5514 pass · 0 fail (others' tests landed in the tree) · tsc 0 (`typescript@5.9.3`).
- **Team C:** my hunk is the one gate line (+ its comment) in `createBooking`; I did not touch the sale paths.

## Review — the LINE amendment (@Fanta) + the live-check ruling — @Silver, 2026-11-08
- **✅ The LINE amendment is accepted on code.**
  - I re-ran SF tsc 0 and `bun test` 1435 pass / 0 fail.
  - `git status` = `CheckinContent.tsx` + `dictionaries.ts` + the new test, exactly the amendment's scope.
  - The branch is only on `VOUCHER_EXHAUSTED`. The words are Porter's TH/EN pairs, with no Retry.
- **Live check, ruling (a):** Fanta is right on both counts, and her live checks for 861 and 870 are **withdrawn from this TASK's Done list**.
  - **Login:** nobody types the password on sid / uat (owner + Atlas 11-05). Login-gated screens are covered by Tanya's gate after the deploy, or marked NOT_TESTED.
  - **A local SB on sid's `.env`** would run the scheduled jobs with the customer's LINE token. That isn't a check any engineer may start.
  - **So the live behaviour is checked by Tanya's TEST on sid after the SB + SF deploy.** Her list is the one Fanta wrote: the system column last, an OTHER block on it, lesson pickers without it, a 1-hour-left voucher refusing the 2nd booking, an empty one refused on attend, and the LINE page's new title / body with no Retry. Anything behind login that she can't reach is NOT_TESTED, as the standing rule says.
- **Evidence state:** 861 + 870 = code reviewed + tests + build. **The live run belongs to QA after the deploy.**

## Review — Amendment 2 (@Bob) — @Silver, 2026-11-08: ✅ ACCEPTED (DONE)
- **Re-run by me:** SB `bunx --package typescript@5.9.3 tsc --noEmit` = 0; SAFE `bun test` = **5530 pass / 0 fail** (870 + 877 together).
- **The gate:** `scheduler.service.ts:1556` is now `if (input.voucherId)`, the same `prepareVoucherBooking`, so the same refusal and words.
- **Check 1:**
  - An OTHER booking **with** a student and a voucher passes the normal gate.
  - **Without** a student, it's refused by the existing «วอยเชอร์นี้ไม่ใช่ของนักเรียนที่เลือก» check. That's right: a voucher always belongs to a child.
- **Check 2:** the OTHER series creator has no `voucherId`, and there's one writer of the column. Both are pinned by tests.
- **Check 3:** the reserved count has no type filter, so an OTHER row reserves too.
- **Mutation set:** 31 of 31.
- **Security review:** none (only adds a refusal).

## Amendment 3 — from Tanya's sid gate TEST-148 (Porter: "fix it") — @Bob, ≈ 0.75 d, SB only, no migration
**(a) 🐞 D-148-1: two bookings at the same moment both pass the last hour.**
- **Cause (read, `scheduler.service.ts:1403–1412`):** `prepareVoucherBooking` reads the voucher with a plain `findFirst` and counts `reserved`, and nothing serialises two transactions doing that for the same voucher. Both see 1 available, and both insert.
- **Fix:** the **first** statement of the gate, inside the booking's transaction, **locks the voucher row**: `SELECT … FROM vouchers WHERE id = $1 FOR UPDATE` (drizzle `.for("update")`). Then read `used_hours`, count `reserved`, and decide. A second booking on the same voucher waits for the first to commit, then sees 0 available → the usual refusal.
- **Apply the same lock in the attend door** (`scheduler.service.ts:~4580`, Bob's own "two check-ins on the last hour" limit from the 870 BE review): lock the voucher row before `emptyVoucherCheckin` reads `used_hours`.
- **Never lock in the day-end** (it never refuses, so it has nothing to protect, and it would serialise the whole night's run).
- **Prove it on sid, rolled back:** two real connections, each opening a transaction, the 2nd booking issued while the 1st holds the lock → the 2nd is refused after the 1st commits. Add a DB-less test for the lock being requested (the statement carries `FOR UPDATE`), and put it in the mutation set.

**(b) O-148-1: ending a voucher leaves an อื่นๆ row reserving / drawing.**
- **Cause (`lib/voucher.ts:83–84`):** `endableVoucherDraws` keeps `bookingType === "VOUCHER"` only. Its comment says "a voucher never owns any other kind", but Amendment 2 made that false: an อื่นๆ row can carry `voucher_id`.
- **Fix:** drop the type filter. A whole-voucher cancel removes **every** live draw on that voucher dated today or later, VOUCHER **and** OTHER, the same REQ-103 "future draws" rule. The cancel preview lists them too, so the admin sees what goes.
  - Correct the comment.
  - Grep the other callers of `endableVoucherDraws` and say each one is still right.
- **Report, read-only:** what an attend or the day-end does today on an OTHER row whose voucher is **ended**. After (b) it can only be a past-dated row, so say whether it would still deduct.
- **Tests:**
  - an OTHER row with the voucher, dated tomorrow, is cancelled by the voucher end and listed in the preview;
  - one dated yesterday is left alone (the day-end's);
  - a VOUCHER row behaves as before.
  - Add them to the mutation set.

**Words:** none new. **Done =** tsc 0 · SAFE suite green (before / after) · the mutants bite · the sid proof (rolled back, residue 0) · report in `inbox/SA-B.md`. It rides the next SB deploy; Tanya re-runs D-148-1 + O-148-1.

## BE report — Amendment 3 (Bob, 2026-11-09) — DONE-pending-review, no migration, nothing committed
- **(a) D-148-1 the row lock.** `lockVoucherRow(exec, id)` = `select … from "vouchers" where "vouchers"."id" = $1 for update` (drizzle `.for("update")`), returning the row. It is the **FIRST statement** of `prepareVoucherBooking` (before the prior-booking read, the expiry re-count write and the reserved count) and it REPLACES the plain `findFirst`, so the gate's `used_hours` is read under the lock. The **attend door** (`updateBookingStatus` "attend", ~l.4600) takes the same lock before `emptyVoucherCheckin` and judges the **fresh** locked row (the booking's embedded voucher may be stale). **The day-end never locks** (pinned: `jobs.service.ts` contains neither `lockVoucherRow` nor `.for("update")`).
  - **Sid proof (two real connections, rolled back, host .206 checked first):** conn 1 opens a transaction and takes the lock on a real voucher row; conn 2 asks for the same lock with a 1.5 s `lock_timeout` → **BLOCKED (SQLSTATE 55P03)** while conn 1 holds it; after conn 1 rolls back, conn 2 gets the lock at once. Only `SELECT … FOR UPDATE` ran — no write of any kind, both transactions rolled back, residue 0.
  - **DB-less tests (added to the 870 suite):** the lock is the first call of the gate and asks for `update` (call-order test); the REAL statement text ends `… for update`; the attend door locks and refuses on the FRESH row (stale 4/5 vs locked 5/5 ⇒ 409, nothing written, the lock requested); the second booking after the first's reservation is refused; the day-end has no lock.
- **(b) O-148-1 a voucher end cancels every future draw.** `endableVoucherDraws` lost its `bookingType === "VOUCHER"` filter (comment corrected: Amendment 2 made «a voucher never owns another kind» false). It is now «live AND dated today or later», for **any** row of the voucher's. **Callers (all two, same rows):** `previewVoucherEnd` (the dialog lists them) and `endVoucher` (cancels them) — both pass `loadVoucherForEnd`'s rows = *every booking whose `voucher_id` is this voucher*, so each is still right and the preview lists exactly what the cancel removes. Tests: an OTHER row tomorrow is doomed (and listed), one dated yesterday is left to the day-end, a VOUCHER row behaves as before, delivered / cancelled rows untouched.
- **Read-only report — what an attend or the day-end does today on an OTHER row whose voucher is ENDED:** neither looks at `ended_at`. The attend door draws on `booking.voucherId` whatever the type or the voucher's end; the day-end `if (b.voucherId)` branch likewise. **After (b)** only a PAST-dated live OTHER row can remain on an ended voucher (the day-end's to settle), and **it would still deduct** `used_hours + 1` from that ended voucher (the balance is «frozen» for new draws, not for rows already delivered — REQ-103's «an attended hour stays attended»). Not changed here; say if a past OTHER row on an ended voucher should settle WITHOUT a draw.
- **Tests / mutants / suite:** the 870 suite 30 pass (was 23); the mutation set 38 mutants (A3: L1–L5 lock, E1–E2 end; G9 / G10 re-aimed) — **all bite**, and every other set in the tree has no survivors. Full SAFE `bun test` → **5652 pass · 0 fail**; tsc (5.9.3) 0.
- **Mirror edits (pre-approved kind, tagged 🔻 TASK-870 A3):** `voucher-recount-yields-task569.test.ts` (its fake executor gains the `select().from().where().for()` lock) · `voucher-end-req103.test.ts` (the `endableVoucherDraws` case: the old «a COURSE row untouched» line becomes «an OTHER row is doomed too»).

## Review — Amendment 3 (@Bob) — @Silver, 2026-11-09: ✅ ACCEPTED (DONE)
- **Re-run by me:** SB `bunx --package typescript@5.9.3 tsc --noEmit` = 0; SAFE `bun test` = **5687 pass / 0 fail**.
- **(a) The lock:**
  - `lockVoucherRow` (`scheduler.service.ts:1408`, `.for("update")`) is the first statement of the booking gate (`:1414`).
  - The attend door judges the **freshly locked** row (`:4598–4599`). The day-end doesn't lock.
  - The sid proof with two real connections (the 2nd blocked until the 1st released; read-only `SELECT … FOR UPDATE`, rolled back) is the evidence D-148-1 needed.
- **(b)** `endableVoucherDraws` (`lib/voucher.ts:83–84`) has no type filter now. Both callers were re-checked by Bob; the preview equals the cancel.
- **Bob's read-only answer:** a **past-dated** OTHER row of an ended voucher still deducts at attend / day-end.
  - **No change.** It's exactly how a past VOUCHER row behaves under REQ-103 ("a past-dated draw … is the day-end's to settle"). Both draw types now follow one rule.
- **Mutation set:** 38 / 38.
- **Security review:** none. A row lock + a filter change, with no new input and no exposure.
- **Rides the next SB deploy;** Tanya re-runs D-148-1 + O-148-1.
