# TASK-447 — 🔴 `REQ-105 §7` CUSTOMER DEFECT: the bot answers Khwan with NOTHING when she types her phone — an unlinked chat with no session is SILENT by rule, and the greeting that asked for the phone is the OA's own, not ours. Make the phone step always answer — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-23) · **Size S.** No migration (53 = 53). Demo OA only for the owner's re-test; agents touch no OA.

## §0 The report (owner/Tanya → @Porter → me, 09-23)
Khwan, demo OA, after unblock: typed `0924912848` at 7:16 → got the follow greeting + the phone prompt again; typed it again at 7:18 → **nothing at all**. Porter's last correction: `0924912848` **IS** a `sid` parent (children incl. KKTEST). "The bot often ignores her commands." The owner's account is fine.

## §1 My read (verify first, do not redo)
1. **Every `linkFamilyByPhone` outcome already produces a reply** (`line-webhook.service.ts:452–460`: bad phone · bound elsewhere · line bound to another family · archived · new · found). So the silence is NOT the not-found branch Porter first suspected, and NOT the collision branch — **the phone text never reaches that code.**
2. **Why it cannot reach it:** `AC-16 SILENCED FALLBACK #4` (`:1345`) — *an UNLINKED chat with no session gets silence for any text* — then `if (!session) return;` (`:1348`). The phone step lives on `session.step = AWAIT_CODE`, set only by `action=enter` (the menu button) or `สมัคร`. **The greeting she answered is the OA's own auto-greeting** (our `follow` dispatch is dead by the owner's ruling, `:1555`) — so LINE asked her for a phone and **nothing in our code was listening**. This is DEF-9/TASK-248's exact shape ("the bot asked a question nothing was listening for") on a door TASK-248 did not cover.
3. **The second possible layer — the MUTE:** `doCallAdmin` (`:1057`) writes `MUTED_STEP` + `mutedUntil`; while muted, free text is silent by design (`AC-25`, `:1268`) and only `เปิดเมนู` re-opens. Her OLD menu's 6th cell was `Help` — **check whether that cell's postback is `action=admin`**; if it is, a single tap muted her, and "the bot often ignores her commands" is that mute, not this bug. Report her mute state as part of the diagnosis (the owner can read it from the demo OA's DB — a DATA REQUEST I will raise if you need it).

## §2 Build
- **The rule:** in an **unlinked, un-muted** chat with **no session**, a **phone-shaped** message (the existing `normalizePhone`/validity check — no new parser) runs the SAME customer link path as `AWAIT_CODE` (`verifyAndLink`, one call site; no second phone flow — TASK-248's rule), so every outcome above answers. Anything else stays silent (AC-16 unchanged, pinned by value: `สวัสดี`, `เมนู`, a nickname ⇒ still nothing).
- **Muted stays silent** — that is the owner's rule (`§AC-25`) and this task does not weaken it. But say in your report whether the mute has an expiry in practice (`muteUntilFrom()`) and how a parent who tapped `Help` once ever gets the bot back; if the only door is `เปิดเมนู`, flag it for the owner (a mute that never ends is a bot that "ignores her", and that is his call, not ours).
- 🚫 No new step, no second phone flow, no change to the mute rule, no `follow` dispatch (the owner's ruling stands).
- Pins: a phone-shaped text from an unlinked chat with no session ⇒ the link reply by value (found · not found · archived · bound-elsewhere); the same text while MUTED ⇒ silence (by value); non-phone text ⇒ silence; a linked chat unchanged (its 21 pins byte-identical).

## Definition of Done
- [ ] The diagnosis stated (which of §1.2 / §1.3 the data shows; the `Help` cell's postback named) · the rule by value · suite **count** · tsc 0 · 53 = 53 · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log. The owner re-tests on the demo OA.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-23) — your §1.2 read confirmed AND §1.3 answered: the `Help` cell IS `action=admin`; 2800 pass / 0 fail; 8/8 mutations bite

**Numbers:** `bun test` **2800 pass / 0 fail**, 215 files (+1: `src/services/line-phone-in-silence-req105.test.ts`, 9 tests) · `tsc --noEmit` **0** · 53 = 53 (no migration) · 1 pin moved (`line-silence.test.ts`'s "all five fallbacks are `return`s" — #4 is a branch now, re-pinned on its three lines).

## §1 The diagnosis — BOTH of your layers are real, and they are different bugs
1. 🔴 **§1.2 is the silence (confirmed, by value).** Every `linkFamilyByPhone` outcome replies; the text never reaches it. `decideMessageRoute(undefined, null) === "silence"` ⇒ `if (route === "silence") return;` fired before `if (!session) return`, so a phone typed into an unlinked chat with no session was dropped on the floor. Pinned through the REAL dispatcher (`handleLineWebhookEvents` over fake DB reads): before the fix that event produced **zero replies and zero writes**; after it, the link reply comes back with her child's name. This is DEF-9/TASK-248's shape exactly — and the greeting she answered is the OA's own auto-greeting (`follow` is still not dispatched; pinned by absence, the owner's ruling stands).
2. 🔴 **§1.3 is the "often ignores my commands", and it is confirmed by SOURCE:** `KNOWN_RICH_MENU.areas[5]` is `action=admin`, and **`KNOWN_RICH_MENU_EN` spreads the TH areas** (`{ ...KNOWN_RICH_MENU, name: "…-known-en" }`) — so the cell her old English menu labels **`Help`** posts `action=admin` ⇒ `doCallAdmin` ⇒ `mutedUntil = muteUntilFrom()` ⇒ **60 minutes of silence for every free text**, by AC-25's design. One curious tap on `Help` and the bot goes quiet for an hour: that is the customer's sentence, in code. (Pinned: the cell, the shared areas, the postback's handler, `muteUntilFrom()` inside `doCallAdmin`.)
   ⇒ **Her mute state on the demo OA is still worth reading** (it decides whether her 7:18 message hit the mute or the silence — the fix answers the second, not the first), but the sweep of TASK-446 plus this fix means she cannot land in either state by accident again: the new menu's `คุยกับแอดมิน` says what it does.
3. **The mute EXPIRES** (`MUTE_MINUTES = 60`, pinned by value at the boundary: muted at 12:59, free at 13:00:01) and `เปิดเมนู` re-opens it early. So it is not a bot that never comes back — **but a parent who taps `Help` and waits, with no rich menu to tap and no idea the word exists, simply gets nothing for an hour.** 📌 For the owner (flagged, not built): either the English label stops saying `Help` (it is a hand-over to a person, not help), or the mute confirms itself in words. Both are his bytes.

## §2 What was built — one branch, no new flow
- **`isPhoneShaped(input)` in `services/parent.service.ts`**, beside the `normalizePhone` the link path itself uses: the trimmed text must be **only** digits and separators (`space · - · . · () · a leading +`) and normalize to **≥ 9 digits — `linkFamilyByPhone`'s own floor** (`phone.length < 9 ⇒ phone-invalid`), read off the same normalizer so the two cannot drift. By value: `0924912848` · `092-491-2848` · `+66924912848` open the door; `สวัสดีค่ะ` · `เมนู` · `KKTEST` · **`สวัสดีค่ะ 0924912848`** · `12345678` do not. A chat that types its number alone is answering a question; a chat that mentions one is talking.
- **The door, inside the existing `route === "silence"` branch:** a non-phone still `return`s (AC-16 unchanged); a phone **adopts the exact state the `เข้าใช้ระบบ` button sets** — `setStep(lineUserId, "AWAIT_CODE", "customer")` — re-reads the session and **falls through to the ONE `AWAIT_CODE` handler**. 🚫 No new step, no second phone flow, no copy of `verifyAndLink` (pinned: exactly two `setStep(…, "AWAIT_CODE", "customer")` sites — the button and this door — and `verifyAndLink` still has one caller). Every outcome therefore answers in its existing words, `settleLinkedRole` links her menus, and a second failure still hands over to a person (AC-18).
- **Untouched and pinned so:** a MUTED chat (the gate returns long before this branch — a mutation that moves the door above it bites), a LINKED chat (the same text reaches the parent commands), `follow` (still not dispatched), the mute rule itself.

## Break-and-watch — `mut447.mjs`, 8 mutations, **8 bite** (`try/finally`, sha-256 restore byte-identical)
A the door removed (the defect restored) · B the step set but the session not re-read · C the door opens for any text · D the door presumes teacher · E the door moved above the mute gate · F a phone inside a sentence opens it · G the 9-digit floor dropped · H a floor that drifts from `linkFamilyByPhone`'s.

## For the owner's re-test (demo OA, no deploy request)
Unlinked chat → type `0924912848` alone → the bot answers (her children, or the exact refusal). Type `สวัสดี` first → still nothing, as designed. If she is still silent, she is MUTED: `เปิดเมนู` re-opens it, or it lifts by itself within the hour — and that is §1.3, not this bug.
⛔ Only you mark this DONE. ▶️ TASK-448 next.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-23)
Re-run by me: **2800 pass / 0 fail** · tsc 0 · 53 = 53 · `isPhoneShaped` beside the link path's own normalizer · exactly TWO `AWAIT_CODE/customer` setters (the button and the new door). Both layers now have names: the silence (fixed here) and the `Help` cell — `KNOWN_RICH_MENU_EN` spreads the TH areas, so the cell labelled **`Help`** posts `action=admin` and mutes the chat for 60 minutes. That is the customer's "the bot ignores my commands", and it is copy + a menu decision, not a defect — raised to the owner via Porter. The door adopting the button's exact state (rather than a parallel flow) is the right call.
