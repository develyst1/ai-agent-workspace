# TASK-735 — D2 (row 46): a "CONFIRMED SCHEDULE" to the FAMILY when a CAMP is booked, re-sent on an edit or a cancel — BE, M (≈ 1.7–2.2 d)
- Source: `COPY-SET-khwan-workbook-2026-10-11.md` §(d) **D2**, her row 46 verbatim (TH = EN): `📅CONFIRMED SCHEDULE:⏎Student : Student A⏎Program : Balance Camp Full Day Full Week ⏎Date : 12-10-2026 - 16-10-2026⏎Time : 10:00-15:00⏎Remark : Sample remark` · Khwan Q6: half-day prints its hours (*"ใช่ค่ะ"*), an edit or cancel re-sends (*"ส่งใหม่ค่ะ"*) · the hours: the CEO · Porter 2026-10-12 GO (one final release)
- Status: ✅ DONE incl. the TEST-099 F1 rework · Tanya's TEST-099 re-run PASS on back `5aa0f1c` (log 2026-10-12)
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-12)
- **Claim:**
  - ✅ `src/lib/line-message.ts` + `src/lib/line-i18n.ts` (Team B's): the new kind + layout, **ADDITIONS only**. ⚠️ Team A's TASK-800 will REMOVE 5 dead address keys in `line-i18n.ts`, last. Don't touch those keys; if both touch the same hunk, the second asks.
  - ❓ **`src/services/camp.service.ts` (Team A's): the emit sites for BOOKED · CHANGED · CANCELLED.** Find them by running (`createPackage` / `planDays` / `redeemDays` / the un-plan or cancel path, whichever actually changes a family's booked days), **list each line**, and ask. Porter grants.
  - 🔴 SAFE test command only (TASK-723 has it). 🔴 run → list → ask → THEN edit. Own-team pins: Silver grants (reported); other teams' files + shared inventories: Porter.

## Build
1. **A new kind** (e.g. `camp_booked_parent`), ONE text for both languages, her layout:
   ```
   📅CONFIRMED SCHEDULE:
   Student : {student}
   Program : {program}
   Date : {first} - {last}
   Time : {hours}
   Remark : {note}
   ```
   - `{student}` = the ONE name rule (`studentNamesOf`).
   - **`{program}` = the camp package's sale name** (her sample `Balance Camp Full Day Full Week`). 📌 **Q3 has no recorded answer:** this default follows her own sample. Mark it `📋 DRAFT` until Porter confirms.
   - **`Date`** = the booked days' first – last (the house date format); a single day ⇒ just that date (declare it).
   - **`Time`** = the FIXED hours for the booking's half (all day / morning / afternoon). **FIXED hours (ฟีน, the CEO, 2026-10-12, verbatim in `COPY-DRAFT-khwan-camp-halfday-and-weeks-2026-10-12.md`):** morning `10:00-12:00` · afternoon `13:00-15:00` · all day `10:00-15:00`. **Times print with a COLON** (the set-1 house rule), not her dot. ONE constant map, used by both TASK-735 and TASK-736 (put it in `lib/camp-hours.ts` or beside the camp renderers; decide and declare).
   - **`Remark`**: only when the package / booking has a note; otherwise the line is omitted (house rule). If no note field exists, the line never prints; declare which.
2. **Sent:** once when the camp days are BOOKED; **again** when they are CHANGED; and on a CANCEL (her "ส่งใหม่").
   - **Decide and declare** what the cancel message says: the same layout reflecting what is left, or a cancel title. If it needs a NEW title word, STOP and ask me (copy).
   - To the student's family (the existing household recipients; no family linked ⇒ nothing).
3. The booking itself never fails because the message did (the outbox's existing rule).

## Definition of Done
- [ ] By-value tests: full-day / morning / afternoon print `10:00-15:00` / `10:00-12:00` / `13:00-15:00` (a COLON); one message per booking; a re-send on a change; the cancel case; no family ⇒ none; Remark shown / omitted.
- [ ] Mutation set: the dot format back · the half ignored (all day always) · no re-send on a change · sent twice on one booking.
- [ ] tsc · full suite (SAFE) with counts. Nothing committed. **Journal stays 69** (no migration expected; if one is needed, STOP and ask).

## Implementation Notes
**Bob, 2026-10-12 — Team B's files BUILT; the camp.service emits are LISTED, not edited. Nothing committed.**
- NEW `lib/camp-booked-notice.ts` — `notifyCampBooked({ packageId, weekId? })`: reads the package's CURRENT `PLANNED` days (so every message says what is true NOW), groups them by (week, half), and sends ONE «CONFIRMED SCHEDULE» per group to each account of the student's household (`householdLineUserIds`, the ONE accessor). **No separate "changed" or "cancelled" code:** a change or a cancel just calls the same function and the message reflects what is left. Send-once key = `camp-booked:{package}:{week|half}:{the booked dates}:{account}` — the same booked days never go twice; a changed set (day added / cancelled) is a new key ⇒ a re-send (Khwan Q6). No linked family · no student · nothing planned ⇒ nothing is sent. Any failure is caught and logged — **the booking stands**.
- `line-message.ts` case `camp_booked_parent`: her row-46 layout, ONE text for both languages — reusing the approved title (`📅CONFIRMED SCHEDULE:`) and the labels `Student` / `Program` / `Date` / `Time` / `Remark` through `fieldLines` (no new i18n key, no new template key). `Date` = first - last in the house format (a single day ⇒ that one date; **declared:** a scattered DAILY booking also reads first - last, as the TASK says); `Time` = `campHoursOf(half)` (the shared map, TASK-736); `Remark` = the PACKAGE'S own note (`camp_packages.note` exists), only when non-empty.
- **`Program` = the package's sale name** (`CAMP_CARD[...].name`, e.g. `Camp — full day, full week`) — 📋 DRAFT (Khwan Q3 unconfirmed; her sample was `Balance Camp Full Day Full Week`). **Journal stays 69; no migration.**
- Tests: NEW `lib/camp-booked-confirmed-task735.test.ts` (**12**) + `.mutations.json` (**8 BITES · 0 SURVIVED**, checksum identical: G1 dot back · G2 half ignored · G3 no re-send on a change · G4 sent twice · G5 empty Remark · G6 a cancelled day counted · G7 dates unordered · G8 the booking failing with the notice). I also re-anchored 730's mutation V2 (a new `case` now sits before `default:`; same mutation, new anchor).

## Questions
**LISTED — the `camp.service.ts` emit lines (all three AFTER the transaction commits; each is ONE call + the import):**
1. **BOOKED — `createPackage`** (≈ :395–399, between the `db.transaction` and `void recordSale(...)`): `if (input.firstWeek) await notifyCampBooked({ packageId: result.id, weekId: input.firstWeek.weekId });`
2. **BOOKED/CHANGED — `redeemDays`** (≈ :443–451, after the tx, before `return { planned, package: … }`): `await notifyCampBooked({ packageId, weekId: input.weekId });` (days added later = a changed booking; there is NO other edit path in the service — the only other writer is `markDay`).
3. **CANCELLED — `markDay`** (≈ :460–483): when the new status is `CANCELLED` (the only cancel; `assertDayTransition` allows it only before the day): the tx already reads the day (`d.campWeekId`) — I need it OUT of the tx (the tx returns `d.campPackageId` today; **+1 returned field**), then `if (status === "CANCELLED") await notifyCampBooked({ packageId, weekId });`.
4. + the import line `import { notifyCampBooked } from "../lib/camp-booked-notice";`. camp.service.ts has no local changes (Jason's 712 is committed). Existing camp tests are expected to stay green (the notifier swallows its own errors); I'll run first and list any before touching.
**ASKING:**
- (a) 🔴 **Grant the 3 emits above** (Porter).
- (b) 🔴 **The cancel of the LAST planned day:** the message says "what is left", and when nothing is left there is nothing to confirm, so **nothing is sent** (the family hears nothing about that last cancel). A "nothing booked any more" message needs a NEW title word (copy). Send nothing, or ask Khwan for the words?
- (c) 🔴 **Shared inventory pins** (+1 renderer `case`, `camp_booked_parent`; KINDS 42 → 43): `message-trailing-req085-16-3.test.ts` (lines 74, 121) · `no-iso-date-leak.test.ts` (104) · `no-placeholder-leak.test.ts` (48, 130). Porter's call; I will not touch them before the relay.

## Review
- **Silver, 2026-10-12:** your asks went to Porter as ONE request. For (b) I recommended the approved `cl_title` (`❌ ยกเลิกคาบเรียน:` / `❌ CLASS CANCELLED:`) for the last-day cancel, so her 'ส่งใหม่' is honoured with no new words. ⛔ Hold until I relay.

- **✅ Porter (2026-10-12):**
  - **(a) GRANTED:** the 3 emits in `camp.service.ts` (`createPackage` after its tx · `redeemDays` after its tx · `markDay` on CANCELLED + ONE field returned from the tx);
  - **(b) TAKEN:** the LAST-day cancel sends her layout under the approved `cl_title` (`❌ ยกเลิกคาบเรียน:` / `❌ CLASS CANCELLED:`), no new words; a partial cancel re-sends the confirm with the days left;
  - **(c) GRANTED:** the KINDS 42 → 43 pins (`message-trailing` :74/:121, `no-iso-date-leak` :104, `no-placeholder-leak` :48/:130).
  - Team A's `0069` lands LAST, so the 69 → 70 count pins are THEIRS. ▶️ GO.

**Bob, 2026-10-12 — GRANTS APPLIED.** (a) the three `camp.service.ts` emits, each AFTER its tx: `createPackage` (only when `firstWeek` planned days), `redeemDays`, and `markDay` for `CANCELLED` only (its tx now also returns the day's week / date / half — +1 returned object, `packageId` unchanged). Exactly 3 call sites (pinned). (b) the cancel of the LAST planned day: nothing is left to confirm ⇒ her layout under the approved `cl_title` (chat language) for the day that went — `Date` = that day, `Time` = its half's hours; a cancel while days REMAIN is the ordinary «what is left» CONFIRMED SCHEDULE. Its own send-once key (`camp-cancelled:…`). (c) KINDS 42 → 43 in message-trailing (74,121), no-iso-date-leak (104), no-placeholder-leak (48,130) and camp-3b (the 736 hours, 5 lines). Tests now **18** in `camp-booked-confirmed-task735.test.ts` (adds the last-day cancel both languages, the cancel-while-days-remain case, no family ⇒ none, and the three emit sites by source) and the set is **12 BITES · 0 SURVIVED** (G9 the last cancel lost · G10 wrong title · G11 every mark sends · G12 redeem silent). Journal 69; no migration.
**Suite (SAFE): 4612 pass / 15 fail (345 files).** All 15 reds are Team A's uncommitted address-wizard work (step machine, `checkFullAddress`, `index.ts` unguarded-route evidence …); I compared the failure lists: none touches camp, the KINDS pins or any file of mine. tsc: the only errors are in Team A's `parent.service.ts`.

## 🔁 Rework: TEST-099 F1, "a partial cancel back to an EARLIER state sends nothing" (fix before uat)
**Tanya's sequence:** booked 09–10 ⇒ sent · added 11 ⇒ sent "09-11 – 11-11" · **cancelled 11 ⇒ NOTHING** (the family still holds "…11-11", FALSE) · cancelled 10 ⇒ sent.
**Cause (code, `lib/camp-booked-notice.ts` ≈ :41):** the idempotency key is per STATE (`camp-booked|camp-cancelled:{package}:…:{sorted dates}`), and the outbox refuses a repeated key. ⇒ Coming back to ANY earlier set of days reuses an old key and is silently dropped. It compares against every earlier message, not the LAST one.
**Fix (Team B's own file, no grant needed):**
1. Read the **last** camp message for this package + this recipient (by the key's `{package}` prefix, newest first). **If its state (dates + half + cancelled) equals the new state ⇒ skip** (nothing changed for the family).
2. Otherwise enqueue with a key **chained on that last message**: `camp-booked|camp-cancelled:{package}:{recipient}:after:{lastOutboxId|none}:{state}`.
   - Two triggers of the same change (a retry, a double click) have the same predecessor + state ⇒ the same key ⇒ ONE message.
   - A return to an earlier state has a new predecessor ⇒ a new key ⇒ **re-sent**.
3. Decide and declare how "the last message" is read (key prefix + `created_at desc`, or a `packageId` on the payload). 🚫 Never compare against all history.
**DoD:**
- [ ] **Her exact sequence pinned by value:** 09–10 ⇒ msg 1 · +11 ⇒ msg 2 (09–11) · −11 ⇒ **msg 3 (09–10, RE-SENT)** · −10 ⇒ msg 4 (09).
- [ ] The same change triggered twice ⇒ one message. Two recipients (two family accounts) are each told once.
- [ ] Mutation set (add to `camp-booked-confirmed-task735`): the old per-state key back ⇒ bites on msg 3 · the skip removed ⇒ bites on the duplicate.
- [ ] tsc · full suite (SAFE). Nothing committed. 🔴 run → list → ask → edit (anything outside `camp-booked-notice.ts` + its tests ⇒ list first). **The back is the release candidate: touch nothing else.**
- **Reproduce:** Tanya's TEST-099 recipe on sid, old build first; the same recipe proves the fix.

**Bob, 2026-10-12 — TEST-099 F1 REWORK BUILT (before uat).** Files touched: `lib/camp-booked-notice.ts`, `lib/camp-booked-confirmed-task735.test.ts`, `lib/camp-booked-confirmed-task735.mutations.json` — **nothing else** (`git status` shows exactly these three; the rest of the back is the release candidate).
- **How "the last message" is read (declared):** `notification_outbox` where `recipient_line_user_id = {account}` AND `idempotency_key LIKE 'camp%:{package}:%'`, `ORDER BY created_at DESC LIMIT 1` (the key prefix carries the package; no schema change). Each camp message's payload now also carries `batch` = a short hash of the COMBINED state it announced (every (week|half) group's sorted dates, + the last-day-cancel flag).
- **The rule:** (1) if the last message's `batch` equals the state about to be sent ⇒ **skip** (the family already holds exactly this); (2) otherwise send every group with the key **`camp:{package}:{account}:after:{lastOutboxId|none}:{batch}:{group}`**. Two triggers of one change (a retry, a double click) share predecessor + state ⇒ same key ⇒ ONE message; a return to an earlier state has a NEW predecessor ⇒ a new key ⇒ re-sent. Never compared against all history. The released build's old-format rows (`camp-booked:…`) carry no `batch` ⇒ read as "different" ⇒ the first new message is sent (safe direction).
- **Tanya's exact sequence is pinned by value** (a stateful fake outbox with a real unique-key refusal): booked 09–10 ⇒ msg 1 · +11 ⇒ msg 2 (09–11) · −11 ⇒ **msg 3 (09–10, RE-SENT)** · −10 ⇒ msg 4 (09) — four distinct chained keys; the same change twice ⇒ one message; two accounts each follow their own chain; a two-half booking triggered twice ⇒ still two messages, not four.
- Set **15 BITES · 0 SURVIVED** (checksum identical): G3 = the OLD per-state key back bites on msg 3 · F2 = the skip removed bites on the duplicate · F3 chain constant · F4 oldest-first · G4 re-aimed (the old "one account twice" mutant became equivalent once the skip existed; now "the recipients share one chain").
- **Suite (SAFE): 4644 pass / 0 fail (346 files); tsc 0.** Reproduce on sid with Tanya's recipe (old build first): msg 3 should appear on the new build.

**Silver, 2026-10-12 — ✅ F1 REWORK DONE.**
- **Re-run by me (SAFE):** the full back **4644 / 0**; set `camp-booked-confirmed-task735` **15/15 BITES**, `CHECKSUM identical`. That includes **G3** (the old per-state key back ⇒ bites on her sequence) and F2–F4 (the skip, the chained key, the last-message lookup).
- **Tanya's exact 4 steps are pinned by value** on a stateful fake outbox that refuses repeated keys: msg 3 (09–10) is RE-SENT. The same change twice ⇒ one message; two accounts ⇒ their own chains.
- ⭐ **Checked the lookup's reach:** `LIKE 'camp%:{package}:%'` cannot catch another camp message. The reminder key is `camp-{recipient}:{personId}:{date}:…` (`camp-reminder.ts:41`); the deduction uses a stamp; `camp-sale:` is the sales table.
  - The `camp%` prefix also matches the OLD `camp-booked:{pkg}:…` keys already on sid, so the switch-over does not re-send old states.
- Scope: `camp-booked-notice.ts` + its test + set only. The rest of the release candidate is untouched.
