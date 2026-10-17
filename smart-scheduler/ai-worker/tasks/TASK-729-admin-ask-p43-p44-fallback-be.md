# TASK-729 — P43/P44: the last two «คุยกับแอดมิน» admin notices, with the LINE display name and the proposed fallback — BE, S (PRE-BUILD, DRAFT)
- Source: `COPY-SET-khwan-workbook-2026-10-11.md` rows **P43** (`admin_asked_for_admin`, owner-approved 2026-10-07: `🔔 Please support Admin "Chat name".`) and **P44** (`unlinked_asked_for_admin`, her words `🔔 Please support "Chat name".`) · **open word = the fallback, Khwan Q7** (`COPY-DRAFT-khwan-questions-2026-10-11.md:22`) · Porter overnight brief 2026-10-12
- Status: ✅ ENGINEERING DONE (Silver, 2026-10-12) · 📋 DRAFT pre-build: the fallback ships ONLY if Khwan's Q7 matches
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-12)
- **Claim (asked of Porter in one list):**
  - `src/lib/line-message.ts` + `src/lib/line-i18n.ts` (Team B's): the two cases + the fallback key;
  - `services/line-webhook.service.ts`: **ONLY the «คุยกับแอดมิน» handler** (`doCallAdmin`, ≈ :1156-1157; it was granted for 727's P41/P42);
  - the existing profile read `lib/line-client.ts` (≈ :119), **read-only use, no edit**.
  - 🔴 **The standing order, no exceptions:** run → list → ask → THEN edit. One line or twenty.
- 🔴 **SAFE test command only** (TASK-723 has it).

## What to build
1. **P43 / P44 get their own cases** (today both fall into the generic bell). It is **ONE text for both languages**, like P40–P42 (727):
   - P43: `🔔 Please support Admin "{chatName}".`
   - P44: `🔔 Please support "{chatName}".`
2. **`{chatName}` = the LINE display name, read AT SEND TIME** from LINE's profile (the existing read), **never stored**.
3. **The fallback, when LINE gives no name (or the read fails):** `ผู้ใช้ LINE` + the time the button was pressed (`HH:mm`, the house time format; Khwan Q7: *"จะขึ้นว่า "ผู้ใช้ LINE" พร้อมเวลาที่กด"*).
   - Decide the exact slot shape and declare it (e.g. `"ผู้ใช้ LINE · 14:05"`). 🔒 Its key is marked `📋 DRAFT wording: Khwan Q7 pending`.
   - 🔑 **A failed profile read costs the NAME, never the alert** (727's try/catch rule, BEFORE the alert/mute).
4. P43/P44's text is already approved by the owner / hers. **Only the fallback is DRAFT.**

## Definition of Done
- [ ] By-value tests:
  - P43 and P44 with a display name;
  - the fallback with no name AND with a throwing profile read (the alert still goes);
  - the time format;
  - P40–P42 unchanged (pinned).
- [ ] Mutation set: the name stored / logged · the alert lost on a failed read · the fallback without the time · P43 → the generic bell.
- [ ] tsc · full suite (SAFE) with counts · `unhandled-between-tests: 0`. Nothing committed. **Nothing goes to sid until Porter says.**

## Implementation Notes
**Bob, 2026-10-12 — BUILT (inside the grants). Nothing committed. Base: HEAD d32bdc4.**
- `lib/line-message.ts`: cases `admin_asked_for_admin` (`🔔 Please support Admin "{name}".`) and `unlinked_asked_for_admin` (`🔔 Please support "{name}".`), one text for both languages. `name` = `payload.chatName`; none/blank ⇒ the DRAFT fallback.
- `lib/line-i18n.ts`: one key, `aa_chat_fallback` = `ผู้ใช้ LINE`, marked `📋 DRAFT wording: Khwan Q7 pending`. **The slot shape (declared):** `ผู้ใช้ LINE · HH:mm` — the time is appended by the renderer from `payload.pressedAt` (Bangkok, `bangkokNow().time`, the house HH:mm); no time on the payload ⇒ the bare words.
- `lib/line-client.ts` (Porter's grant): ONE new function `getProfileDisplayName` beside `getProfileLang` — best-effort (no token / HTTP error / network throw / 3 s timeout / blank name ⇒ `null`). Nothing existing edited.
- `services/line-webhook.service.ts` `doCallAdmin` only: for an admin or an unlinked chat the read + `pressedAt` happen **inside the existing try/catch, BEFORE the alert and the mute**. A failed read costs the NAME, never the alert.
- Tests: NEW `lib/admin-ask-p43-p44-task729.test.ts` (**15**, incl. the **no-name-in-the-row** pins: the handler payload source holds no name and no read; the worker returns a copy and the row's object stays name-free; the read is the ASKER's profile; other kinds untouched and no fetch) + `.mutations.json` (**9 BITES · 0 SURVIVED**, checksum identical; the DoD's four = A1 the name stored in the row, A2 a failed read throws, A3 fallback without the time, A4 P43 → bell). Granted edits: the count pins (KINDS 39 → 42, shared with 730), `voucher-deduction-req087` (1 test), `command-list-by-role-task523` (1 test).
- `services/outbox.service.ts` (Silver/Porter's grant): ONE exported function `withAskerName` + ONE changed call (`formatOutboxMessage(await withAskerName(row.payload as any), …)`; the `row.payload as any` text is kept because `remaining-zero.test.ts` pins it).
- **Full suite (SAFE): 4512 pass / 0 fail, 338 files; tsc 0.**

## Questions
**Both asks ANSWERED (Silver / Porter 2026-10-12) and DONE:**
1. ✅ `command-list-by-role-task523.test.ts` (the ~8 lines of its "NO copy invented" test): the parent / coach kinds still render the bell without a name; the admin / unlinked kinds now pin P43 / P44 with the fallback.
2. ✅ **"Never stored" = literally.** The handler no longer reads the profile at all (and no longer imports it): the outbox row carries only the asker's `lineUserId` (already there) and `pressedAt`. The name is read by the PUSH WORKER at send time: `withAskerName` in `outbox.service.ts` (P43/P44 only) reads the ASKER's profile and returns a COPY with `chatName`; the row is never written back with it, nothing logs it, a failed read ⇒ `null` ⇒ the fallback and the send goes on; every other kind passes through untouched with no read.

## Review
- **Silver, 2026-10-12, on "never stored": ✅ keep the promise LITERALLY.** The name must not be written to the `notification_outbox` row. ⇒ **Move the profile read to the push worker** (`outbox.service.ts`, the P43/P44 path only; asked of Porter) and carry only the LINE user id (already there) in the payload.
  - The fallback time = the time PRESSED: carry that in the payload (it is not the name).
  - Pin it: the outbox row holds no display name.
  - ⛔ Wait for the grant. The task523 pin (≈ :170-173) is also asked.
- **✅ GRANTED by Porter (2026-10-12):**
  - `command-list-by-role-task523.test.ts` ≈ :170-173 (re-aim the P43/P44 pin);
  - **`src/services/outbox.service.ts`, the P43/P44 path only:** the display-name read at PUSH time;
  - **plus a pin proving the outbox row carries NO name.**
  - ▶️ GO. Then the full suite (SAFE) + the sets, and nudge me.

## Review
**Silver, 2026-10-12 — ✅ ENGINEERING DONE (DRAFT until Khwan's Q7).**
- **Re-run by me:** SAFE full suite **4512 / 0**; set `admin-ask-p43-p44-task729` **9/9 BITES**, `CHECKSUM identical` (Team A had nothing open, so the runner was safe to use).
- **"Never stored" is LITERAL now:**
  - the handler carries only the asker's `lineUserId` + `pressedAt`;
  - `withAskerName` (`outbox.service.ts`) is gated to P43/P44, reads the profile at PUSH time, returns a COPY (never written back), and degrades to the fallback on a failed read while the send goes on;
  - the no-name-in-the-row pins are in.
  - ⭐ Re-aiming the equivalent mutant A2 at the real guard was the right call.
- **Scope:** every file in the tree is inside a grant (the new `line-client.ts` function, the 3 count lines, the two re-aimed pins, the handler, the push path).
- **Porter (2026-10-12):** accepted as DONE, DRAFT. **Stays UNCOMMITTED** until Khwan answers + the owner approves; the uat note gets a step 0 so it cannot ride into the final uat build. Bob does not touch it further.
- **Porter (2026-10-12):** ⏳ 729 waits for the owner on option A (Porter recommends A). If yes, A is in this release (build A; step 0 on sid with his phone). If no, 729 ships with the name + a fallback WITHOUT the time.
