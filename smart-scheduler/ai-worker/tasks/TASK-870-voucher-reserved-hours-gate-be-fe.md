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
