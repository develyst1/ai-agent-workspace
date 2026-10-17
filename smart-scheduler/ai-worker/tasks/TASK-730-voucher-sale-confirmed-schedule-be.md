# TASK-730 — D1 (row 45): a "CONFIRMED SCHEDULE" to the FAMILY when a VOUCHER is sold — BE, S (≈ 1 day; PRE-BUILD, DRAFT)
- Source: `COPY-SET-khwan-workbook-2026-10-11.md` §(d) **D1**, her row 45 verbatim (TH = EN): `📅CONFIRMED SCHEDULE:⏎Student : Student A⏎Program : VOUCHER  5 HR⏎*Expiry date : 3 Months⏎Remark : Sample remark` · **open: Khwan Q5** (`COPY-DRAFT-khwan-questions-2026-10-11.md:18`) · Porter overnight brief 2026-10-12
- Status: ✅ DONE (Silver; housekeeping 2026-10-16) · in back `881c9a1` + the MONTHS rework `9fa5eb2`; Remark via TASK-732 (`942321c`)
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-12)
- **Claim (asked of Porter in one list):**
  - `src/lib/line-message.ts` + `src/lib/line-i18n.ts` (Team B's): the new kind, its layout, its keys;
  - **`src/services/scheduler.service.ts` `createVoucher` (≈ :2909): ONE emit line only. It is Team A's file, so it needs Porter's grant;**
  - the outbox kind's type/registry wherever it lives (find it by running, list it).
  - 🔴 run → list → ask → THEN edit.
- 🔴 **SAFE test command only.**

## Today (code, 2026-10-12)
- Nothing goes to the family when a voucher is sold. They hear per class booked (`booking_confirmed`) and per class used (`course_deduction`, the voucher title).
- `createVoucher` (`scheduler.service.ts:2909`) is the SALE. 🚫 **`importVoucher` (`:2282`) is NOT a sale** (historical data): it must NOT send. Pin it.

## What to build (defaults Porter set; DRAFT until Khwan's Q5)
1. **A new message kind**, sent ONCE by `createVoucher` to the student's family (the existing household recipients; no family linked ⇒ nothing sent, as for every family notice).
2. **Her layout, her words, ONE text for both languages:**
   ```
   📅CONFIRMED SCHEDULE:
   Student : {student}
   Program : {program}
   *Expiry date : {expiry DD-MM-YYYY}
   Remark : {note}
   ```
   - `{student}` = the ONE name rule (`studentNamesOf`).
   - `{program}` = the voucher's existing program title (as `course_deduction` prints it; her `VOUCHER  5 HR` is a sample).
   - **`*Expiry date` = the real expiry DATE** in the house date format (every other message prints a date; her "3 Months" is Q5). 🔒 DRAFT.
   - **`Remark`:** the sale's own note **if the voucher has one; the line is omitted when empty** (house rule). If a voucher has no note field at all, the line never prints; declare which.
3. 🔒 The keys are marked `📋 DRAFT wording: Khwan Q5 pending (expiry format + Remark source)`.

## Definition of Done
- [ ] By-value tests:
  - a sale ⇒ exactly ONE family message with that layout, the real expiry date, and Remark shown / omitted;
  - an IMPORT ⇒ no message;
  - no linked family ⇒ none;
  - the sale itself never fails because the message did (the outbox's existing rule).
- [ ] Mutation set: import sends · Remark printed empty · expiry printed as a length · sent twice.
- [ ] tsc · full suite (SAFE) with counts · `unhandled-between-tests: 0`. Nothing committed. **Nothing goes to sid until Porter says.**

## Implementation Notes
**Bob, 2026-10-12 — BUILT (inside the grants). Nothing committed. Base: HEAD d32bdc4.**
- `lib/voucher-sold-notice.ts` (NEW): `notifyVoucherSold(voucher)` — the household's accounts via `householdLineUserIds` (the ONE accessor), one outbox row per account, send-once key `voucher-sold:{voucherId}:{lineUserId}`; no linked family ⇒ nothing; **any failure is caught and logged — the sale stands**.
- `services/scheduler.service.ts` `createVoucher`: **ONE call line + one import** (`await notifyVoucherSold(result.voucher)`, after the commit and before `recordSale`). `importVoucher` untouched and pinned to send nothing. Putting the lookup in the new lib file (not inline) also kept three source-count pins about `scheduler.service.ts` (`householdLineUserIds(` ×4, the `studentName:` census) unchanged — nothing in Team A's tests moved.
- `lib/line-message.ts` case `voucher_sold_parent`; `lib/line-i18n.ts` one DRAFT key `vs_program` (`VOUCHER {hours} HR`, marked `📋 DRAFT wording: Khwan Q5 pending`). The rest of her layout reuses the approved title (`ob_course_title` = `📅CONFIRMED SCHEDULE:`) and the labels `Student` / `*Expiry date` / `Remark`, through `fieldLines` — **no new template key** (it would have forced an edit to `message-time-format.test.ts`).
- **Declared (DRAFT, Q5):** `Program : VOUCHER 5 HR` — her sample had TWO spaces (`VOUCHER  5 HR`), read as a typo; a voucher has no program name of its own, so the title is built from the hours. `*Expiry date` = the real date, `DD-MM-YYYY`. **`Remark` can never print today** (a voucher row has no note field; the sale takes none): the renderer prints it only if a payload ever carries `note`.
- Tests: NEW `lib/voucher-sold-confirmed-task730.test.ts` (8) + `.mutations.json` (**7 BITES · 0 SURVIVED**, checksum identical; the DoD's four = V1 sent twice/import, V2 empty Remark, V3 expiry as a length, V4 one account twice). **Item 4 of my list (the createVoucher fakes): no existing test needed an edit** (measured before, confirmed after: `archive-student-req093`, `suspend`, `validation.parent-phone-task644`, `course-ended-writes` all green untouched).
- **Full suite (SAFE): 4508 pass / 1 fail (the 729 test, see TASK-729 Question 1), 338 files; tsc 0.**

## Questions
1. ❓ For Khwan's Q5 (already with her): `Program` for a voucher — `VOUCHER 5 HR` as built, or the voucher's sale name? And where would `Remark` come from?
2. Nothing else outside the claim was touched.

## Review
- **Silver, 2026-10-12:** ✅ one import + one call in createVoucher, the logic in the new `lib/voucher-sold-notice.ts`, no Team A pin moved: accepted and reported to Porter. Item 4 is void (no fake needed).

## Review
**Silver, 2026-10-12 — ✅ ENGINEERING DONE (DRAFT until Khwan's Q5).**
- **Re-run by me:** SAFE full suite **4512 / 0** (with 729); set `voucher-sold-confirmed-task730` **7/7 BITES**, `CHECKSUM identical`.
- **In `createVoucher`:** one import + one call (reported to Porter); the work is in the new `lib/voucher-sold-notice.ts`; no Team A pin moved; the four `createVoucher` test files untouched. The `importVoucher` no-send is pinned.
- **Remark:** no voucher note field exists ⇒ omit-when-empty (Porter puts that to Khwan with Q5).
- **Porter (2026-10-12):** accepted as DONE, DRAFT. **Stays UNCOMMITTED** until Khwan answers + the owner approves; the uat note gets a step 0 so it cannot ride into the final uat build. Bob does not touch it further.

## 🔁 Rework — Khwan's Q5 answer (2026-10-12): *"ขึ้นเป็นเดือนค่ะ Remark เอามาจากตอนสร้างค่ะ"*
1. **`*Expiry date` prints MONTHS, not a date:** `{months} Months` (her sample `3 Months`; ONE text for both languages, as her row).
   - `{months}` = **`VOUCHER_VALIDITY_MONTHS[totalHours]`** (`src/lib/voucher.ts:15-16`, read-only use). The same table decides the real expiry.
   - 📌 **Why this is MORE truthful at the sale:** the expiry DATE is provisional at the sale, because validity counts from the **first booking** (`scheduler.service.ts:1406`). Months is exactly right; a date would have been wrong.
   - Decide and declare the singular (`1 Month`) if any package has 1.
2. **Remark: HELD** (a new voucher field = the owner's yes/no; sized in `SIZING-teamB-khwan-answers-2026-10-12.md` §1). The line stays omitted.
3. Keep the DRAFT marker until the owner's approval of the wording is recorded. Re-pin by value (`3 Months` for a package whose validity is 3), and the mutations (a date printed instead of months: bites).
- 🔴 run → list → ask → edit; SAFE command. The tree also holds 729 (don't touch it).

**Bob, 2026-10-12 — REWORK DONE (Khwan's Q5).** `*Expiry date` prints MONTHS: the payload carries `months` = `VOUCHER_VALIDITY_MONTHS[totalHours]` (5 h → 3, 10 h → 6, 15 h → 9; `lib/voucher.ts`, read-only) and the renderer prints `{months} Months` (her `3 Months`; no singular case exists, every package is 3/6/9). The outbox row carries NO date any more (the real expiry is provisional until the first booking). Remark stays held (TASK-732). Program wording still DRAFT. Tests re-pinned (a package of 5/10/15 h ⇒ 3/6/9 Months, never a date); set **8 BITES · 0 SURVIVED** (V3 re-aimed: a date printed instead of months; new V8: wrong months row). Files: `voucher-sold-notice.ts`, `line-message.ts` (the one expiry line), its test + set. Full suite 4521 pass / 4 fail (the 4 = TASK-731's task537 test, asked).
