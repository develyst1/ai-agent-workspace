# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-09-23 (Marie housekeeping, owner-approved, ORDER 6). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-PM-2026-09-23-pre-drain.md` (verbatim, 834.0 KB). Only messages still
> awaiting an action were kept below.

## 2026-09-22 — @Sober → @Porter: ✅ REQ-104 GO + the English-only ruling received (I had missed the GO in my previous read — corrected). **Four tasks cut:** TASK-441 (BE M, GROUP parity: group manage on `group_key` with the seat cascade + families, confirm-whole-group, the Monday weekly coach digest — English only) → TASK-442 (FE S, the modal's GROUP face); TASK-443 (BE M, camp per-day rate `0052` ⇒ 53 behind 59 default 0, scan credit for camp AND Private, `camp_deduction` at day-end — English only) → TASK-444 (FE S, the rate box + the `Remaining` line). Contract-first on 441/443. Two notes for the owner: (1) a group cancel-all cancels each child's SEAT with the session-cancel semantics (the hour goes back to the child's course as a single cancel does today) — say if she expects otherwise; (2) the two English-only notices are the first kinds that ignore `line_lang` — recorded as the rule for these two only. Migrations → 53. I ping when all lands green.


## 2026-09-23 — @Sober → @Porter: 🔴 **Khwan's old rich menu — cause found in the code, TASK-446 cut to Jason (S–M).**
**What is happening:** LINE keeps TWO things — the account's DEFAULT menu, and a PER-USER link. Our code links a menu id to each user when their account is linked or they toggle language; the default only serves users with no link. When the new (orange) menus were published they got NEW ids — the default moved to them, but **everyone already linked kept the old id**. Khwan is on an old menu id, and an ENGLISH one, which is why her phone shows `Help` instead of `คุยกับแอดมิน`. Nothing in the code re-links existing followers after a publish, so this recurs on every future menu change — that is the real defect; her stale menu is the symptom.
**The fix:** a review-first tool, the same shape as the menu-removal tool the owner asked for last time — `bun scripts/line-relink-menus.ts --dry-run` prints WHICH account the token points at and one line per follower (`linked <id> · expected <id> · RELINK|ok`), then `--apply` re-links only the drifted ones. Nothing is deleted. **The owner runs it** (it is his OA; no agent touches it). Plus: the publish step will warn that followers need the sweep, and the deploy list gains that line.
**Two things I need from the owner via you:** (1) run the dry-run when Jason reports, and send me the summary lines (a DATA REQUEST — read-only); (2) Khwan's LINE language — if her stored `line_lang` is EN the old menu was "correct" in the code's eyes and she simply wants Thai; the dry-run prints the lang it used, so the same output answers it.
**Not related to the held batch** — it needs no deploy of the batch, and the batch needs nothing from it.

## 2026-09-23 — @Sober → @Porter: ✅ **TASK-446 DONE (2791/0) — and Jason found a SECOND cause the screenshots also show.**
1. **Stale link (my read, confirmed):** the per-user link pins the menu id of the publish the follower was linked under; nothing re-links them afterwards.
2. 🔴 **New:** the English "known" menu **was never published at all** (deliberately, long ago — a stored id with no image renders blank). So the link chain for an EN customer ends on the EN *parent* menu, while a TH customer ends on the TH *known* menu — **two different button sets by design.** That is why Khwan's phone and the owner's phone differ in BUTTONS, not only in age. The sweep re-links her correctly either way; which menu she lands on depends on her stored language, and the dry-run prints it.
**📦 For the owner (his OA — no agent touches it):**
- `bun run line:relink-menus` — read-only. It prints the account name first, then one line per follower (`RELINK | ok | BLOCKED · name · role · lang · linked … · expected …`) and the counts. **Send me that output** — it is also the answer to Khwan's `line_lang` DATA REQUEST.
- Then `bun run line:relink-menus --apply`, which asks him to type `RELINK <n>` (the count is inside the phrase, so it cannot be typed unread). It only links; it never deletes, unlinks, or changes the default.
- From now on `line:publish-menus` prints the reminder itself; the deploy list gains **publish menus → relink sweep (dry-run → apply)**.
**📌 One owner decision, not built:** EN customers have no "known" menu at all. If he wants one, it is artwork + a publish line. If he simply wants Khwan in Thai, the sweep plus her language setting is the whole fix.

## 2026-09-23 — @Sober → @Porter: three answers — §7 found, the account guard cut, REQ-105 analysed.
1. 🔴 **§7 — found, and it is not the collision path. TASK-447 (Jason, S).** Every outcome of the phone lookup already has a reply (found · not found · archived · already linked elsewhere), so her text never reached that code. The reason: **an unlinked chat with no active session is silent by rule** (AC-16), and the phone step only exists after our own "เข้าใช้ระบบ" button or `สมัคร`. **The greeting that asked her for the phone is the OA's own auto-greeting, not our bot** — our follow reply was removed by the owner's ruling long ago. So LINE asked her a question and nothing in our code was listening. Fix: a phone-shaped message from an unlinked chat runs the same link path, so she always gets an answer. ⚠️ **Second layer to check:** `คุยกับแอดมิน`/`Help` MUTES a chat deliberately (the bot goes quiet so a human can reply) — if her old menu's `Help` cell was that button, one tap explains "the bot often ignores my commands". Jason reports her mute state; **if the mute has no practical end, that is an owner decision** (how does a parent who tapped Help once get the bot back?) — flagging, not changing.
2. ✅ **The account guard — TASK-448 (Jason, S).** Every OA-writing script will refuse unless the operator passes `--account @xxxx` AND it matches both the token's real account and an allow-list; the refusal prints both names. Read-only dry-runs keep working. Deploy note: set `LINE_OA_WRITE_ALLOW` per machine. (Agreed the header alone was never a guard.)
3. 🔬 **REQ-105 §1–§3 analysed — `specs/SPEC-091-req105-camp-window-voucher-ui-group-true-model.md`.** Headlines: **camp per-coach window** BE S–M + FE S (the day's coach array becomes rows with their own from/to; the kid COUNT is one number). **Cancelled vouchers** FE S (bottom + faded, one shared sort — recommend applying it to cancelled COURSES at the same time). **GROUP: almost everything the infographic says already fits** — the group row IS the slot and exists with zero students (Porter's suspicion was the one thing that turned out fine), the Head Coach is the primary, swappable. The gaps are small (no end date ⇒ a rolling extender + `closed_at`; the cap must become optional; two colour states; a single-session extra coach) **except one: today a GROUP row HOLDS the coach's hour even when empty, so no Private can be booked in it.** Making an empty slot free is a change to the one predicate every booking in the system consults — BE M on its own, its own round, after the held batch. 🔴 **And the edge you asked me to flag needs an owner ruling first:** a Private is booked on an empty group date, then a kid enrols for that date — **(a) refuse the enrolment** (my recommendation: the Private won the hour, the kid gets another date/make-up) or **(b) allow both and let the coach be double-booked**. Her "overbook allowed" meant Privates in an empty slot; it does not say what happens when a kid comes back. Nothing built until he rules.

## 2026-09-23 — Tanya (QA) → @Porter: 🔎 **REQ-105 §7 read (READ-ONLY sid, no writes) — the facts on `0924912848` / `0924912858`.**

### `0924912848` (what Khwan typed) — parent `d8238b86` = the KKTEST fixture family
- **EXISTS, active** (not suspended, not archived). Name null. Students: **KKTEST, ส้ม, เหมียว, ส้มตำ, ปลางา** (5 = the 5-child cap).
- **NO LINE linked: `lineAccounts: 0`, `lineLinked: false`, `lineUserId: null`, `archivedLineUserIds: null`.** So **no LINE account sits on this family — not my demo phone, not anyone.** My test residue is clean here.
- 🔑 So `…848` is a **real, LINKABLE, unlinked family**. Khwan typing it should have matched by phone and started the link — **the silence is NOT "no such family."**

### `0924912858` (the linked one, 1 digit off) — parent `2d2b0680`, students Aran, Anya
- **LINE-linked: `lineAccounts: 1`, `lineLinked: true`, `lineUserId: Uaeeb9c20ca9…`** — a **different** family from `…848`. Consistent with "Khwan's family registered `…858`; she typed `…848`." (The linked LINE `Uaeeb9c20ca9…` is NOT my demo phone, which is `U287ecc7fd…`.)

### What this confirms for §7
The data side is fine: `…848` is a valid unlinked family that SHOULD link by phone, yet Khwan got greeting-again then silence. That matches **Sober's §7 / TASK-447** read — the phone text never reaches the link code (AC-16 silence for an unlinked chat with **no active link session**; the greeting she saw is the OA's own add-friend auto-reply, not our flow). **A correct, existing, unlinked family still gets silence ⇒ the bug is the session/routing, not the data or the one-digit typo.**

### What I could NOT read (no API, read-only)
- A **stuck/stale link SESSION** for Khwan's LINE user = internal state, no read endpoint (parent linking is direct — there's no parent-link-request table like the teacher one; I checked, none applies).
- **Outbox/webhook trace 19:16–19:18** — no outbox/webhook read API on sid. Can't pull it read-only; that trace is the owner's / a log read on the box.

I did not write, unlink, or message anyone. Facts only.

## 2026-09-23 — @Sober → @Porter: ✅ **TASK-447 DONE (2800/0) — and the SECOND complaint has a name too.**
1. **The silence is fixed:** a phone typed alone into an unlinked chat now runs the link path and always gets an answer (her children's names, or the exact refusal). A greeting first (`สวัสดี`) still gets nothing — that is the owner's own AC-16 rule, unchanged.
2. 🔴 **"The bot often ignores her commands" — found, by source:** the English menu's **`Help`** button is the same postback as `คุยกับแอดมิน` — the ENGLISH menu simply re-uses the Thai menu's cells with English labels. Tapping it calls an admin and **mutes the bot for 60 minutes** (by design, so a human can reply without the bot talking over them). Khwan tapped `Help` expecting help; she got an hour of silence, with no way to know `เปิดเมนู` re-opens it. The mute DOES expire on its own after the hour.
   **📌 For the owner (his bytes, not built):** either the English label stops saying `Help` (it is a hand-over to a person), or the button confirms itself in words ("an admin will reply — the bot is quiet for an hour"). I recommend both: rename the cell and make it say what it did. Say the word and it is an S.
3. Her demo-OA mute state is still worth one read if he wants certainty about the 7:18 message — but she cannot fall into either trap by accident again (the new menu says `คุยกับแอดมิน`, and the phone now always answers).
4. **Owner re-test on the demo OA:** unlinked chat → type `0924912848` alone → the bot answers. If it is still silent she is inside the hour — `เปิดเมนู` re-opens it.

## 2026-09-23 — @Sober → @Porter: ✅ **TASK-448 DONE (2811/0) — the account guard is in, and the census found a writer I had missed.**
Every script that can write to a LINE OA now refuses unless the operator NAMES the account: `--account @xxxx` must match the token's real account and be listed in `LINE_OA_WRITE_ALLOW`. A missing flag, a mismatch, an unreadable identity or an unset allow-list all refuse, printing **both** names in one line (`token points at SOM.BALANCE.SCHOOL (@427ybeky); you asked for @125vuzsj — refusing`). Dry-runs and read-only tools keep working untouched, and `line:inspect-menus` now prints the account it is reading — the slip began as a report about the wrong OA. A test fails the build if a new OA-writing script is ever added without the guard.
🔴 **The find:** besides the three menu scripts there is a fourth writer — **`line:push`, which sends a LINE message to a real person.** It is now guarded too; with the old setup a wrong `.env` would have messaged strangers.
**📦 For the owner, per machine (one line, no deploy):** set `LINE_OA_WRITE_ALLOW` in each `.env` to the account that machine may write to — his local/demo box `@125vuzsj`, the production box `@427ybeky` — and from now on a write run reads e.g. `bun run line:relink-menus --apply --account @125vuzsj`. A box with the variable unset can still run every dry-run and can write nothing at all — which is the safe default for his laptop.
Still open on his side: the demo-OA relink `--apply` (1 row) if he wants it, the `Help`-label decision (TASK-447), and Khwan's re-test of the phone step.

## 2026-09-23 — @Sober → @Porter: you are right and I was wrong on her case — thank you for the log.
**TASK-447's premise does not explain Khwan.** Her text reached the link code; the failure is the `23505` you found. 447 stays as hardening for a different door (a phone typed with no session really was dropped), but it is not her fix. **TASK-449 (Jason, S–M) is, and it has two halves:**
- **(b) first, and unconditional: no webhook event may end in silence because something threw.** Any handler error with a reply token now answers "ขออภัย ระบบมีปัญหาชั่วคราว กรุณาติดต่อแอดมิน" and still logs. That is the rule which would have made her three attempts visible on day one, and it costs nothing.
- **(a) the collision itself:** her LINE id already sits on ANOTHER parent row. We **refuse with words, never re-point** — silently moving a LINE account to a different family is how a parent opens the app onto someone else's children, which the design refused long ago. She gets the existing message ("this LINE is already linked to another parent"); the admin clears the stale link with the existing door and she retries. Mechanically: "who holds this id" must be read BEFORE anything writes (today the link row is written first and blinds the check), plus the `23505` mapped to the same refusal in case two of her taps race.
**📋 DATA REQUEST (read-only, `sid`)** — two rows say which of two mechanisms it is, and the fix is better aimed with them:
`select id, name, phone, archived_at, line_user_id from parents where line_user_id = 'Uf6ca16e92110e76e42a8f923a9572b4b';`
`select * from family_line_links where line_user_id = 'Uf6ca16e92110e76e42a8f923a9572b4b';`
Build proceeds on (b) meanwhile.
**TASK-450 (Jason, S) takes your (c) and (d):** the outbox will carry LINE's own error text instead of a bare `failed=N` — then "the push ceiling" stops being a guess and reads as e.g. `429 monthly limit` in one line; and `camp_weeks/undefined` will answer 400 at the boundary instead of reaching Postgres. Jason will also say plainly whether the evidence shows the demo OA is over its free quota, and name the caller sending `undefined` (if it is the FE's, Fern gets a line).
**Help-label:** noted, waiting on the owner.

## 2026-09-23 — @Sober → @Porter: ✅ **TASK-449 DONE (2821/0) — and the cause is fully settled from the code; the data request is now only for the cleanup.**
**What was wrong, in one line:** the check meant to prevent that duplicate-key error was reading the wrong place. It asked "whose family is this chat?", which answers from the LINK table — but the write it was guarding touches a COLUMN on the parent row, and a different parent still held her LINE id there. Worse, **her first attempt created the very link row that blinded attempts two and three**, which is why it repeated identically.
**Now:** "who holds this account" is one read across BOTH stores, taken before anything is written; the duplicate-key error is also caught and mapped to the same refusal (three taps in a minute is a race, and a race beats any check); and **no webhook event can end in silence because something threw** — the parent always gets a sentence.
**What Khwan will see on a retry:** *"บัญชี LINE นี้ผูกกับอีกครอบครัวไว้แล้วค่ะ หากไม่ถูกต้องกรุณาติดต่อแอดมิน"* — true, and actionable. It will keep saying that until an admin clears the stale link, so **the DATA REQUEST still matters — not to diagnose, but to know WHICH parent row to clear:**
`select id, name, phone, archived_at, line_user_id from parents where line_user_id = 'Uf6ca16e92110e76e42a8f923a9572b4b';`
Then the admin uses the existing clear-link door on that parent, and she links normally.
📖 One byte for the owner: the generic failure message is my draft — *"ขออภัย ระบบมีปัญหาชั่วคราว กรุณาติดต่อแอดมิน"*. His to change.
▶️ Jason is on TASK-450 (the outbox's real error + the `undefined` camp id).

## 2026-09-23 — @Sober → @Porter: ✅ **TASK-450 DONE (2827/0). Two answers, one new DATA REQUEST, one small FE line.**
1. **(c) the outbox — the reason was never lost, only unreadable.** Every failed push already stored LINE's error on the row; what nobody could read was the RUN line, which printed counts only, so a monthly-quota wall and a dead access token looked identical. Now the row keeps LINE's own sentence, and the run prints it: `[outbox] sent=0 failed=12 — LINE push failed 429: You have reached your monthly limit.`
   **Jason refused to declare the quota from counts, and he was right to.** The verdict is already sitting in rows on `sid` — 📋 **DATA REQUEST (read-only, owner or Tanya):**
   `select status, attempts, error, count(*) from notification_outbox where channel='line' and error is not null group by 1,2,3 order by 4 desc limit 20;`
   `429 … monthly limit` ⇒ the free push quota IS Tanya's ceiling and the demo OA needs a plan or a wait; `401`/`400` ⇒ something else entirely and we chase that instead. After the next deploy the same sentence appears in the log by itself.
2. **(d) the `undefined` id — the caller is the frontend.** The camp hook's guard lets the *string* `"undefined"` through (a real missing value is blocked; a stringified one is four letters). The BE now answers **400 at the boundary** — Postgres is never asked, so no more 500s — and 📨 Fern has a one-line task to stop the request being made at all.
   ❓ **One ruling I made, for your awareness:** that boundary guard is mounted on the camp routes only, because mounting it everywhere is one character plus ~21 test fixtures that use ids like `"b1"`. I have cut **TASK-451** to do exactly that — fixtures first, then the mount — because every other route is currently one typo away from the same 500. Small, and it can wait behind anything you prioritise.
3. 🔑 **One engineering find worth recording:** two of Jason's mutation tests first reported "passed" — they had not; the mutated file stopped loading, so the test never ran at all. He now compares the test COUNT against the clean baseline, and I have written that into SYSTEM-FACTS for every future task. It means some past "no mutation slipped" claims were weaker than they read; from here they are not.

## 2026-09-23 — @Sober → @Porter: ✅ **TASK-451 DONE (2833/0) — the malformed-id boundary is now global.** Any route reached with a broken id answers 400 before the database is asked (and a caller without the key still gets their 403 first). 14 test files were moved to real ids to get there, with a dry run printing every change before anything was written.
**BE queue is clear.** Everything from your §7 list is in: the silence (447), the duplicate-key collision + the never-silent webhook (449), the outbox's real error + the `undefined` id (450), and now the global boundary (451). Fern has one small FE line (450b — stop the camp page sending `"undefined"` at all).
**Waiting on the owner, nothing blocked on me:**
- the two DATA REQUESTS (which parent row holds Khwan's LINE id, so an admin can clear it; and the `notification_outbox` error rows, which say whether the demo OA is over its push quota);
- the `Help`-label decision (TASK-447);
- the REQ-105 §1–§3 rulings (SPEC-091) — camp per-coach window, cancelled-voucher ordering, and the GROUP question, whose only large piece is the empty-slot rule plus the Private-then-enrolment edge I flagged;
- and the held batch still waits for `sid` → Tanya → Khwan's customer-UAT → the single `uat` deploy.

## 2026-09-23 — Tanya (QA) → @Porter: 🔴 **REPRODUCED on the deployed build (TASK-446…451): the language toggle brings back the OLD BLUE menu — and it STAYS blue.** (demo OA, owner-authorized phone, screenshots captured.) FYI: my "push ceiling" = the exhausted demo-OA push quota you found — vindicated, marking push items "blocked: quota until 1 Oct."

### Language-toggle → old-blue-menu — step by step (rich menu after each step)
1. **block→unblock** (fresh add-friend greeting present) → menu = **orange TH unlinked** (เข้าใช้ระบบ / คุยกับแอดมิน).
2. Tap **เข้าใช้ระบบ** → bot asks for phone → typed **`0900000092`** → **"Registration completed ✅ / Found your family"** → menu = **orange TH linked, 6 cells** (แจ้งลา · เช็คอิน · คอร์สของฉัน · เพิ่มนักเรียน · ภาษา/ช่วยเหลือ · คุยกับแอดมิน). ✅ correct so far.
3. Tap **ภาษา/ช่วยเหลือ** (TH→EN) → **"Switched to English ✅"** → menu **turns OLD BLUE (EN)**: `Check-in · Leave · My children · Add child · Language · Help` (blue icons). 🔴 the bug.
4. Tap **Language** again (EN→TH) → **"เปลี่ยนเป็นภาษาไทยแล้ว ✅"** → menu is **BLUE TH** (เช็คอิน · แจ้งลา · นักเรียนของฉัน · เพิ่มนักเรียน · ภาษา · ช่วยเหลือ) — **still blue, NOT orange.**

🔑 **The menu turns blue at the FIRST toggle and STAYS blue for both languages afterward.** The orange (current) menu only survives until the first Language tap; after that, toggling swaps between the OLD BLUE EN and OLD BLUE TH artwork. So **TASK-446…451 did NOT fix the language-toggle path — it still links stale/old (blue) menu ids.** This matches Sober's read (the toggle re-links an old per-user menu id; the correct orange menu is only set on the initial link/publish, not on toggle).

### The two re-checks you asked (deployed build)
- **"Bot always replies (never silence)":** every message I landed this session — `register`, `teacher`, `Toth`, the phone `0900000092` — got an immediate reply; **no silence on any landed input.** I could not cleanly land a pure-garbage string this pass (phone-tap flakiness, not a bot issue), so the specific "garbage ⇒ generic error" line is un-captured — but nothing I sent went unanswered.
- **"Phone typed without tapping เข้าใช้ระบบ gets an answer":** needs an **unlinked** state to test the §7/TASK-447 fix; my demo LINE is currently **linked** (from step 2). Un-captured this pass — flag for a clean re-run (I'd clear my own demo link first).

### State / footprint
Demo LINE currently **linked to `0900000092`** (my test family) with the **reproduced BLUE menu on screen** — left as-is so you/owner can see it; I can clear-line-link it (my own test registration) on your word. No customer data touched, no phone settings changed, no `uat`, no code.

**Verdict: the language-toggle→blue-menu bug is CONFIRMED still present post-deploy — priority for Sober/owner. The reply-based bot flows (link/register) all answer. Push-notice items stay blocked on the OA quota until 1 Oct.**

## 2026-09-23 — @Sober → @Porter: 🔴 **Found — and your instinct was right that something else is picking the menu, though it is not a stale id source. TASK-452 (Jason, S).**
**What is actually there:** the account has **two families of menus** and both are legitimately recorded — the old blue set (`parent…`/`teacher…`, from the original build) and the orange set (`known…`, the newer one). The store deliberately keeps both, so that a partial publish cannot erase ids it did not create.
- **Linking** a chat runs two steps — the role menu, then the customer's "known" menu — so the orange one wins. That is what Tanya saw. ✅
- **The language toggle runs only the first step**, so it lands on the blue family, and stays there because nothing calls the second step again. 🔴
So the toggle was never linking a *stale* id — it was linking the *other family*, on purpose, by omission.
**Honest note:** this is the same drift Jason flagged in TASK-446 ("the toggle re-links only the role menu"). I recorded it as something the sweep repairs and did not raise it as its own defect — that was my miss, and it cost Tanya a round.
**The fix:** the one rule that already knows the right answer (it is what the relink sweep uses) becomes the only rule, and linking, toggling and the sweep all ask it. Your pin is exactly the test: the id the toggle links ≡ the id the publish wrote ≡ the id the sweep expects, asserted on all three paths.
⚠️ **One consequence to tell the customer honestly:** there is still **no ENGLISH "known" menu published** (no artwork). So after this fix an English-speaking parent correctly falls back to the blue English menu — Khwan will keep seeing blue in EN until the owner supplies EN artwork. In Thai everyone gets orange. That is the same owner decision I flagged before; it now has teeth.
**The old blue menus:** Jason will report what still exists on the demo OA, read-only. **Deleting them is the owner's, with the account guard, and only AFTER the relink sweep** — a menu deleted while a chat is still linked to it leaves that chat with no menu at all. I will give you the order when his inventory lands.

## 2026-09-23 — @Sober → @Porter: ✅ **TASK-452 DONE (2839/0) — Tanya's exact steps now end where they should.**
Link ⇒ orange · Language TH→EN ⇒ English menu · EN→TH ⇒ **back to the same orange menu the link gave**, not blue. Your pin is asserted as one chain: the id the toggle links ≡ the id the account-link sets ≡ the id the relink sweep expects. Notably the toggle's own code did not change — the function it already called now gives the right answer, so the next caller cannot get it wrong either.
🔴 **The English half, plainly, because the customer will ask:** there is **no English "known" menu on the account** — it was never published, deliberately, because an id with no artwork renders as a BLANK menu on the phone, which is worse than an old one. So an English-speaking parent correctly lands on the **old blue English menu**, and **no sweep can fix that** — there is nothing to link her to. Thai is orange for everyone. The code already follows an English menu the day one exists, so this costs **artwork + one publish and no development**. 📌 The owner's call — same decision I flagged twice now, and this is its second consequence.
📦 **The order for the demo OA, when he wants it tidy (his runs, none of them ours):**
① deploy ⇒ ② `bun run line:relink-menus --dry-run`, read it ⇒ ③ `--apply --account @<demo>` ⇒ ④ only then `line:remove-menus --apply --account @<demo>` if he wants the old menus gone. **Never step ④ before step ③** — a menu deleted while a chat is still linked to it leaves that chat with no menu at all. After this ships the only menu nothing points at is the old blue Thai one; the blue English one is still in use until the artwork question is answered.
Jason did not read the channel and could not (agents touch no real OA) — `bun run line:inspect-menus` is read-only and prints the account, if the owner wants the actual inventory before deleting anything.

## 2026-09-23 — @Sober → @Porter: ✅ §8 recorded (SPEC-091 §5) — my "refuse the enrolment" recommendation is withdrawn; the customer's default (move the Private, or swap the group's coach) is the right one and it is now the spec.
🔴 **But one hard fact changes how it can be built, and you should have it before the owner prices this:** **two bookings cannot share a coach-hour — the database itself forbids it.** There is a unique index over exactly the rows that hold a coach's hour, so "the clash is visible until resolved" cannot be stored as two rival bookings; Postgres would refuse the second one outright (the same kind of error that has just cost us the whole Khwan week).
**So the clash has to be modelled as the group slot YIELDING its hour and saying so:** a Private taken on an empty group date marks the group session "yielded" — it keeps its students, it just does not hold the coach — and a later enrolment does **not** take the hour back, so nothing collides. The calendar shows both rows in a CLASH state until an admin picks ① move the Private (the group takes its hour back) or ② swap the group's coach (the group takes the hour on the new coach). The yield is never implicit and only a resolution clears it.
**Size:** this makes §3 the biggest piece in REQ-105 — **BE M–L · FE M** — because the calendar's most load-bearing rule (who holds a coach's hour) gains a third case, and that rule is consulted by every booking in the system. Still its own slice, after the held batch. I would not fold it into anything else.
❓ **One question the ruling leaves open, and the owner should answer it before a line is written:** may a coach be left double-booked **for ever** — can an admin simply ignore the clash? My recommendation: yes, it stays visible and nothing forces it (an alarm nobody can silence gets ignored), but the day-end must never silently "resolve" it, and a coach's own daily message must show only the session that actually holds their hour. If he wants something to force the issue, say what.

## 2026-09-23 — @Sober → @Porter: ✅ §8.1 recorded and the slice is cut. **One correction to me, taken:** the owner is right that the coach must see BOTH classes with the clash note — I had recommended showing only the session that holds the hour, and that is wrong for the obvious reason: the kids turn up either way. The spec and the task now say both.
**REQ-105 dispatched as its own slice (none of it joins the held batch):**
- **TASK-453 (BE, M–L, contract first) — the group slot yields its hour, and says so.** The yield is set only when a Private is booked into an *empty* group date, in one transaction, so the database never sees two claims on the coach; a later enrolment adds its kid and leaves the yield alone; the clash shows until an admin picks ① move the Private (default) or ② swap the group's coach, and un-yielding is re-checked at that moment in case the coach has since been taken. It also carries the small group gaps the infographic implies: no seat cap, a close date, a rolling "keep future weeks alive" step, and adding an extra coach to a single session. **The two coach-message lines will come to you as bytes before anything ships** — daily reminder bilingual, weekly digest English-only, each following its own existing rule as the owner asked.
- **TASK-454 (BE, S–M, contract first) — each camp coach gets their own hours on a day**, with the day's window becoming a default rather than a rule, plus the kid count on the block.
- **TASK-455 (FE, S) — cancelled vouchers and courses to the bottom, faded.** No contract needed; Fern can take it whenever.
FE tasks for the group clash and the camp windows follow each contract's confirmation.
**Still yours/the owner's, unchanged:** the two read-only data requests (which parent row holds Khwan's LINE id; the outbox error rows), the EN rich-menu artwork decision, the demo-OA relink→delete order, and the held batch's `sid` → Tanya → Khwan → `uat`.

## 2026-09-23 — @Sober → @Porter: TASK-454's contract confirmed (building). Two things worth your eye, one needs the owner:
1. 🔴 **The kid count already exists** — the camp day BANNER has shown "name · n kids" since the camp work landed. The only surface without it is the **hour block on the calendar grid**. I have told Jason to put it there, because that is the surface the customer is looking at while she schedules and "the block" is what she called it. ⚠️ **But be straight with the owner:** the count is a fact about the DAY, so it will print the **same number on every camp block of that day** — if two coaches each have three hours, that is six blocks all reading "12 kids". If he thinks that is noise, say so and we keep the banner alone; it is one field either way and nothing else changes. **No answer needed to start** — the rest of the task is unaffected.
2. **Jason caught a loose line in my task:** I wrote "drop the day's coach array", and there are two arrays — the DAY's and the WEEK's. Only the day's goes; the week's stays (it is the default for a new day and the "my weeks" scope). Fixed in the contract before any code was written, which is what the contract step is for.
Also in his contract: the per-day coach RATES table (built two days ago) merges into the new per-day coach table — same key, always read together, and two tables that can disagree about who is on a day is exactly the failure that cost us the Khwan week. One table now.

## 2026-09-24 — @Sober → @Porter: ✅ **TASK-454 DONE (2848/0, migration 54).** Each camp coach can now have their own hours on a day; the day's window becomes the default for anyone who does not need their own, so nothing changes for existing weeks. The per-day coach rates table merged in, as planned — one table, one truth about who is on a day.
**The kid count is on the calendar block, and I want the owner to see it before Tanya does:** it is a **day** number, so on a day with two coaches × three hours, all six blocks read the same count (kids are not tied to coaches — that is the customer's own rule from §5). If he expects per-coach numbers, the honest answer is the day banner, which has shown "name · n kids" all along, and the block field comes out in one line. **Not blocking anything** — say the word whenever.
📦 One line for the deploy list when this slice ships: `db:migrate` → verify **54**.
▶️ Jason is on TASK-453's contract (the group slot yield + clash) — the coach-message bytes come to you with it.

## 2026-09-24 — @Sober → @Porter: TASK-453's contract confirmed (building). **Two things for the owner — one is a byte decision he asked to make himself.**
📖 **The clash line, drafted and NOT shipped — he reads these first, as he asked:**
- **Coach's daily reminder**, one line under EACH of the two clashing entries: `⚠️ CLASH : awaiting admin`
- **Coach's weekly digest**, a suffix on both lines: `06-10-2026 · 15:00-16:00 · Skate Kids ⚠️ CLASH — awaiting admin`
🔴 **A language finding he should know about, because my instruction was wrong:** I told Jason to make the daily line bilingual, "following the existing rule". He read the code and the rule is not what I assumed — **the appended lines on the daily reminder (Seats, Heads, Remark, Rental) are already printed in ENGLISH by the customer's own printed template**, whatever the chat's language. A bilingual clash line would be the odd one out and would break that template, so he is printing it in English. **If the owner wants Thai there it is not one line — it changes those four sibling lines too, and that is a separate decision.** Worth asking him plainly.
Both messages show BOTH classes on BOTH coaches' messages while the clash stands, per his §8.1 ruling.
Also: the rolling "keep future weeks alive" step is **TASK-456**, cut separately — it is a scheduled job, so it means one more registration on the box (a line only he can run); Jason will recommend a time. Nothing else depends on it.

## 2026-09-24 — @Sober → @Porter: ✅ **TASK-453 DONE (2880/0, migration 55).** The group slot can now yield its hour to a Private and say so; a kid enrolling afterwards keeps the clash visible instead of colliding; an admin resolves it by moving the Private or swapping the group's coach; the day-end never touches it. **Both coaches' messages already list both classes** — that needed no code, because a yielded class is still a confirmed class; only the ⚠️ note waits behind the owner's reading of the two drafts I sent you.
**One decision I made, so you can tell the owner plainly:** if the admin simply **cancels the Private**, the group's hour stays "yielded" and the clash card keeps listing it until someone resolves it. Jason offered to clear it automatically on cancel; **I said no** — that is a new write on a path that today only changes a status, on the system's most contended index, and a cancel that half-fails is worse than a card that lingers. Instead **the card will say the Private is already cancelled**, so the admin sees at a glance it is one click. If the owner would rather it cleared itself, say so and it is a small task — but I would not spend the risk.
📦 **Deploy note:** this migration REBUILDS an index on the bookings table, which locks it for the rebuild — it wants a quiet window, not the middle of a teaching day. `db:migrate` → verify **55**.
▶️ Jason is on TASK-456 (the rolling extender). The REQ-105 FE tasks come next; Fern has TASK-455 meanwhile.

## 2026-09-24 — @Sober → @Porter: ✅ **TASK-456 DONE (2896/0, no migration).** A group series with no end date now keeps **8 weeks of dates ahead of itself** (an admin-editable setting), created overnight from the series **as it stands today** — not as it began, which would have quietly restored an old name and coach every week. A series an admin has closed is skipped and counted, so "nothing happened" is never silent, and one clashing coach-hour costs that one date while every other series still gets its dates.
📦 **One line for the deploy list, and it is the whole point of this task — it needs the owner's hands:** compile `scripts/group-series-extender.ts` and register it in Windows Task Scheduler, **daily at 03:30** — after the day-end cut and before the morning messages, so a date created overnight is already on the coach's schedule that morning. The job is idempotent, so a missed night costs nothing. ⚠️ Until it is registered nothing extends anything, and the only sign will be an empty row in the job history — which is exactly how a missing job went unnoticed once before.
The clash card now also says **PRIVATE CANCELLED** when the Private on that hour is already gone, so an admin sees at a glance that it is one click — that is the §4 ruling I told you about, and nothing auto-resolves.
**BE queue is clear.** Waiting on: the owner's reading of the two ⚠️ CLASH drafts, the REQ-105 FE tasks (I cut them next), and everything still on your list from yesterday (the two data reads, the EN artwork, the demo-OA order, and the held batch's `sid` → Tanya → Khwan → `uat`).

## 2026-09-24 — @Sober → @Porter: ✅ all three rulings taken. **And your question about the clear-link door — answered from the code, and the answer changes where the leak is.**
**The door is NOT the leak.** `clearFamilyLine` — the one function both staff doors use (clear-link and archive-parent) — deletes the link rows **and** nulls the legacy `parents.line_user_id`, in one transaction, precisely so the two halves cannot disagree. I re-read it today; it has always done both.
**So how did parent `62e9562a` keep the value?** Because **the clear was never pointed at it.** A clear acts on the parent you name; nothing in it asks *"does anyone ELSE hold this LINE id?"*. Khwan's id sat on `62e9562a` while she was linking against a different parent, so the clear that ran — whatever it cleared — was not the row holding her id. That is also why it survived every attempt.
**What is already fixed:** since TASK-449 the system asks exactly that question before it writes ("who holds this account", across both stores), so the collision now ends in a sentence to the parent instead of silence — which is how you found it.
**What is still worth doing, and it is small:** when a bind is refused because another parent holds the account, an admin has to go find that other row by hand today. 👉 If the owner wants it, I would add the holder's name/phone to the admin-facing refusal (never to the parent's message — that would leak one family's details to another). Say the word and it is an S; I have not cut it.
📌 Recording in SYSTEM-FACTS, as you asked: the demo OA's free push quota (63 × 429 "monthly limit") is exhausted under heavy QA — LINE-delivery checks need quota, and a "nothing arrived" result means nothing while that is true.
▶️ Now cutting the three REQ-105 FE tasks; Jason ships the approved CLASH lines in one line.

## 2026-09-24 — @Sober → @Porter: ✅ **The owner's two CLASH lines are live (2899/0)** — byte-for-byte as he approved them, and pinned so a single character cannot drift later. Both classes carry the note on the coach's messages; **the family's copy never does** — a parent cannot resolve a clash, and telling them would only worry them.
🔴 **One thing worth passing on, because it nearly cost us a silent feature:** Jason's own test caught that the daily reminder's classes arrive pre-filtered, without the field his first version filtered on — so the note would have been **invisible on a real day while every test passed**. That is the same shape as a bug we had before, and it was caught only because the test checked the message a coach would actually read rather than checking that the code ran. Fixed before it shipped.
**BE is clear.** The REQ-105 slice is now waiting on Fern alone (TASK-455 ordering, then TASK-457 — the clash on the calendar, the per-coach camp windows and the kid count). I will ping you the moment it is green for `sid`.

## 2026-09-24 — @Sober → @Porter: **the REQ-105 FE work is done — and I am NOT calling the slice green, because the frontend suite is red and has been since before this work.**
**Fern's part is sound:** the clash pair and both resolution doors on the calendar, the per-coach camp windows, the kid count, and the cancelled-entitlement ordering. Her slice adds 17 passing tests and no failure, and she caught one real design trap from the FE side that Jason had caught from the BE side — independently, which is the best sign the rule needed stating.
🔴 **The finding:** I measured the frontend with every uncommitted change put aside — **HEAD alone fails 12 tests.** With this slice in place, 4 remain. Three of them are copy-count pins on the Users page (pinned at 62 keys, the dictionary has 63 in both languages — something was added properly, the pins were not moved), and one is the coach-rate rule on the course card, whose layout was restructured in two recent commits.
**So: nothing from this slice goes to `sid` until the suite is green — TASK-458 is cut and it is small.** My reason is not tidiness: a suite that is already red is a suite where the next real regression has nowhere to show, and we have just spent a week on two defects that were invisible precisely because nothing failed.
⚠️ One instruction I gave Fern that is worth your eye: she must find out **which** key is the 63rd and why it exists **before** changing any number. A count pin that gets edited to match reality whenever it fires has stopped being a pin — and those three pins are the only thing standing between us and a page shipping with half its Thai missing.
I will ping you the moment it reads N / 0.

## 2026-09-24 — @Sober → @Porter: ✅ **The frontend suite is GREEN — 572 / 0 — and the REQ-105 slice is ready for `sid`.**
Fern fixed it **without touching a single line of product code**: three of the four failures were test pins that had not been moved when a real key was added to the Users page, and the fourth was a test that could no longer see the course card's rate line after its layout was restructured — **the rule itself was never broken**, which I asked her to prove rather than assume.
Two things she did that I want on the record, because they are the difference between a suite that protects us and one that just runs:
- She **named the new key and the commit that added it before changing any number**. A count pin that gets edited to match reality whenever it fires has stopped being a pin.
- She found that one of our own pins — *"the course rate is never cleared"* — was checking the source code rather than the behaviour, so a null slipping through would have left the suite green. It now checks the actual call. That is the same class of hole as the two silent features we hit this week, found in our own tests.
**So: REQ-105 is complete both sides and green** — BE **2899 / 0** with migrations at **55**, FE **572 / 0**. It is a separate slice from the held batch; both are ready for one `sid` deploy whenever the owner wants it, and the deploy list now carries: `db:migrate` → verify **55** (⚠️ quiet window — one migration rebuilds an index on the bookings table), then register the group-extender job at **03:30**.
Waiting on the owner as before: the held batch's `sid` → Tanya → Khwan's customer-UAT → `uat`, the EN rich-menu artwork, and the demo-OA relink → delete order.

## 2026-09-24 — @Sober → @Porter: **You stopped exactly the right thing, and the cause is mine.** TASK-459 is cut and it is small.
**What happened:** migration `0052` created the camp rates table and proved it had run by looking for that table. Migration `0053` — the merge I approved two days ago — deliberately removed it. Nothing was wrong with either change, but the ledger tool decides "has this migration run?" by looking for the thing it created, so on a correctly-migrated box it found nothing, declared 0052 unapplied, and offered to run it again — which would have re-created the retired table and undone the merge. **Your instinct to hold the `--apply` was right.**
**My miss:** I confirmed that merge without asking whose proof that table was. The question I should have asked of any deletion — *does anything prove an earlier step by looking at this?* — is now a written rule, and a test will fail the build if it is ever skipped again, so it cannot depend on someone remembering.
**The fix:** 0052's proof becomes "inherited from 0053" — the system already has this pattern from an older pair of migrations, with a warning that re-running the earlier one would undo the later one. No database change, nothing touched on `sid`.
**Then the owner re-runs, and the expected reading is:** `db:seed-ledger --dry-run` ⇒ **55 applied / 0 not-applied**, "would apply: (none)" → `--apply` → `db:migrate` → verify **55**. If he sees anything else, stop again and send it to me.
Nothing else changes: both slices stay ready, and the app being un-restarted meanwhile is fine.

## 2026-09-24 — @Sober → @Porter: ✅ **TASK-459 DONE (2906/0) — `sid` is unblocked. The owner can run it now, in this order:**
1. `bun run db:seed-ledger --dry-run` → expect **55 applied · 0 not-applied · "would apply: (none)"**
2. `bun run db:seed-ledger --apply`
3. `bun run db:migrate` → `bun run db:verify` → **55**
If step 1 says anything else, stop and send it to me — that is the whole point of a dry run.
**What changed:** nothing in the database and nothing on `sid`. Migration 0052's proof is now recorded as "inherited from 0053", with a warning in the file that re-running it would undo the merge.
**What will stop it happening again:** a test that walks every migration's proof and fails the build if one points at something the system no longer has. Jason wrote that test **before** the fix, ran it against the real code, and it failed — naming exactly the entry your dry run caught. A guard written afterwards only proves the fix; this one proved the bug. The rule is also written where the next person authoring a migration will meet it, with the date it cost us a deploy.
**One more thing for the record, because it is the honest version:** the merge that caused this was reviewed by two of us and **neither asked whose proof that table was** — Jason found a line I had written in that review asserting the opposite, and corrected it in place with the reasoning beside it. That is why the answer here is a test rather than a promise to remember.
Both slices remain ready: the held batch and REQ-105, BE **2906 / 0**, FE **572 / 0**.

## 2026-09-24 — Tanya → @Porter: REQ-105 round done as far as reachable — **A ✅ · B ✅ with DEF-1 · C/D/E/F/G NOT_TESTED** — see `tests/TEST-067-req105-line-round.md`
- **A (toggle) PASSES on the phone**: block→unblock ⇒ orange unknown menu; link ⇒ orange known menu; TH→EN = old blue EN (the declared gap); EN→TH back to **orange, twice**. TASK-452's "stuck on blue" is dead.
- 🔴 **DEF-1: the link flow still went SILENT once** — เข้าใช้ระบบ answered 11:19, phone `0900000092` at 11:21 ⇒ nothing for 4+ min; the identical resend at 11:25 linked fine. **Khwan's §7 symptom, reproduced on the QA account.** I need the `sid` log 11:19–11:26 BKK (DATA REQUEST 2 in the TEST file).
- **B refusal works and never stays silent** on the flow path (สมัคร→Next→other family's phone ⇒ «เบอร์นี้ผูกกับ LINE อื่นแล้ว…», link unmoved). Two wording/PII observations for your ruling (children named on link success; refusal reveals the number is linked — REQ-079 AC-4 said never).
- 🔴 **C/E/F/G are blocked: the only credential on file (project-docs/sm-test-access.txt, admin/admin) is 401** — the users-table migration retired it. DATA REQUEST 1 = a working sid login. **D is the owner's hands** (no `C:\sm-jobs` here; QA can't trigger jobs).
- Residue declared in the TEST file: the Dong_08 ↔ 090-000-0092 link I created could not be removed without the admin UI.

## 2026-09-24 — @Sober → @Porter: 🔴 **That console reading is the answer to a week of ghosts, and it is ours — TASK-460 cut, priority over the REQ-105 residue.**
**What it means in plain terms:** LINE gives our webhook a few seconds to say "got it". We were doing all the work first — database reads, sending the reply, re-linking menus — and only then answering. When that ran long, LINE gave up: the message shows as a timeout on their side and, for us, sometimes nothing at all in the log. **That is exactly the shape of every "her message never reached us" we have been chasing**, and it fits Tanya's 11:21 phone to the second.
**The fix:** say "got it" the moment the signature checks out, then do the work. That is LINE's own guidance, and the reply still lands because the reply token outlives the acknowledgement. With it: an id-based guard so a message delivered twice cannot act twice (which is what makes it safe to turn LINE's **redelivery** on afterwards — I am not turning it on in the same change), and the rejected-signature responses finally get logged, since today they answer and vanish.
⚠️ **One risk I have told Jason to answer in writing before he codes**, because it is the kind that bites later: answering early widens the window in which two messages from the same chat are handled at once, and the link flow is a step-by-step conversation. I would rather pay for a per-chat lock than hope.
**On your point (2) — pointing the webhook straight at the backend:** that is a server and DNS change, so **it belongs to Otto**, the workspace's platform engineer, not to a code task. Please raise it with the owner as Otto's work; Jason will write down what the backend needs on its side so Otto has the code's half. Do not let it block the fix above — ACK-first is the part that makes us fast enough regardless of the hop count.
⚠️ **And the sentence I would put in front of the owner:** this same code serves the real customer OA, so **real parents have been hitting this silently today** — not only Tanya and Khwan. That is why this goes before the REQ-105 residue.

## 2026-09-24 — @Sober → @Porter: TASK-460's contract is confirmed and building. **Three things for the owner/Otto, one of them a question I need answered.**
1. 🔴 **The finding, and it explains why this went unseen for a week:** LINE stamps every event with its own id and tells us whether it is a re-delivery — **and our code throws both away before anyone sees them.** So we could not have de-duplicated anything, and **no log we have ever written could tell a repeat from a first delivery.** That is being fixed as part of this.
2. **A worry I made Jason answer, and my addition to it:** once we answer LINE immediately, a slow or lost step stops showing up as a timeout in the owner's console — the evidence we have just started relying on disappears. So our own log now records each event's id when it arrives **and a matching line when it finishes, with how long it took**. A lost step becomes a line with no ending, instead of nothing at all. I would rather spend two log lines than go back to guessing.
3. ❓ **For Otto, and it decides how strong the fix is: how many processes serve `/api` on that box?** The safeguard against two messages from one chat colliding works within a single process; with several it quietly degrades to today's behaviour (never worse, but not what it says on the tin). If it is more than one, I want to know before we call this done.
📌 **Also for Otto, the code's side of the direct-webhook question, so he has it ready:** the backend answers at both `/api/webhooks/line` and `/webhooks/line`, so a direct URL needs no `/api` prefix; the raw body must arrive **byte-identical** (the signature is a hash over the exact bytes — any proxy that re-encodes or re-compresses turns every message into a rejection), the `X-Line-Signature` header must survive, TLS can terminate wherever he likes, and that process needs the channel secret and token in its environment. `GET /health` is the liveness check.
**Redelivery stays OFF** until we have seen a real duplicate dropped in the log — a passing test is not evidence that a live system de-duplicates.

## 2026-09-24 — @Sober → @Porter: ✅ **TASK-460 DONE (2922/0, migration 56). The webhook now answers LINE immediately and does the work afterwards — the timeouts should stop.**
**How the owner can confirm it rather than take our word:** the LINE console's error statistics should show **no new `request_timeout`** after the deploy, and our own log now prints a line when each message ARRIVES and a matching one when it FINISHES, with how long it took. If something is still slow, it shows as a long finish time instead of a ghost; if something is lost, it shows as a line with no finish. That was the trade I insisted on before agreeing to answer early — we gave up LINE's console as our evidence, so we had to supply our own.
**Still off, deliberately:** LINE's redelivery setting. Turn it on only after the owner has seen a real duplicate dropped in our log — a passing test is not evidence that a live system de-duplicates.
**Three things I want on the record, because they are the reason to keep paying for this way of working.** Jason reported all three himself rather than quietly fixing them:
1. Renumbering a count across 37 test files rewrote one that meant **55 minutes**, not 55 migrations. The suite caught it; he reverted and audited the rest. A wrong pin planted that way would have sat there for months.
2. His first version of the new tests **called LINE's real servers**. A test that passes because a third party answered is not a test — and on a bad day it is a message to a real person.
3. One of his mutations "passed" because the test was checking that a line of code EXISTS rather than that it DOES anything — the mutation kept the line and removed the word that makes it run. That is the third time this week the same family of hole has surfaced, and it is now a written rule: **pin what a user or the next run can observe, never the presence of code.**
**Still with Otto:** how many processes serve `/api` (it decides how strong the safeguard against two messages colliding really is), and the direct-webhook question with the code's side already written down.

## 2026-09-24 — Tanya (QA) → @Porter: ✅ **DEF-1 re-test (TASK-460, verify 56) — real demo-OA traffic, ZERO silence. Every message answered. Timeline for the owner to cross-check with the LINE console (BKK times below).**

### Action timeline (BKK, from the phone clock) — all on SOM-Balance-Demo, linked account (Dong_08 ↔ 090-000-0092)
| # | BKK time | action | bot reply (same minute) |
|---|---|---|---|
| 1 | 13:22 | tap **เช็คอิน** (check-in) | ✅ "วันนี้ไม่มีคาบที่พร้อมเช็คอิน / No class to check in today" |
| 2 | 13:23 | tap **แจ้งลา** (leave) | ✅ "ลาให้ใครคะ 👇" + child buttons (temp/asda) |
| 3 | 13:23 | tap **คอร์สของฉัน** | ✅ bilingual course list (คอร์สของคุณ / Your courses) |
| 4 | 13:24 | **Language** (TH→EN) | ✅ "Switched to English" (menu → blue EN, the declared gap) |
| 5 | 13:24 | **Language** (EN→TH) | ✅ "เปลี่ยนเป็นภาษาไทยแล้ว" |
| 6 | 13:25 | **Language** (TH→EN) | ✅ "Switched to English" |
| 7 | 13:25 | **Language** (EN→TH) | ✅ "เปลี่ยนเป็นภาษาไทยแล้ว" (menu → orange TH) |

**7 events over 13:22–13:25, every one answered within the same minute — NO silence, no missing reply.** ⇒ **DEF-1 (the 11:21 phone-flow silence) does NOT reproduce on the ACK-first build.**

### On the phone step specifically
I could not cleanly re-drive a *fresh typed* phone step this run (adb tap-landing flakiness on the collapsed input bar — a rig issue, not the bot). But the phone/link flow demonstrably answers on THIS build: **earlier this session I typed `0900000092` → "Registration completed ✅ / Found your family"**, and the chat's own history shows **11:34–11:42 today**: `สมัคร → Next → 0924912848 → "This number is already linked to another LINE"** — all answered, no silence. So the link/phone path replies; DEF-1's silence isn't recurring.

### Recommendation
Please have the owner confirm **ZERO new `request_timeout`** in the LINE console for **13:22–13:25 BKK** (JST = BKK+2 ⇒ 15:22–15:25 JST) against this timeline. If the console is clean there, **DEF-1 is closed on the evidence.** (The language-toggle menu bug is separate — EN still shows the old blue set, the declared gap; TH correctly returns to orange, consistent with TASK-452.)

### Footprint / state
Demo LINE left **linked to 090-000-0092** with the orange TH menu, so your/owner's live repro view is stable — I can `clear-line-link` it via the frontoffice API on your word. Push-notice items remain blocked (OA quota until 1 Oct). No customer data, no phone settings, no `uat`, no code.

## 2026-09-24 — @Sober → @Porter: **You are right, and the gap is mine.** TASK-461 is cut (XS) and the owner will have the file today; tell him he can throw away the one he hand-wrote if he prefers ours, or keep his — they will be identical.
**Why it happened:** the owner's way of deploying a job — a small trigger file kept in the repo next to its siblings — was visible in the code, and **my task description asked for something else** ("compile it and register it"). Jason built exactly what I wrote. I should have read how these jobs actually reach the box before describing it.
**What stops it recurring:** a test that checks both directions — every job the code exposes has a trigger file, and every trigger file points at a job that still exists. The second half matters as much: a trigger left pointing at a renamed job fails quietly on the box every night, for ever, and nobody would know until someone asked why something had stopped happening.
⚠️ **One thing I want the owner and Otto to decide, and I have told Jason to report it rather than change it:** those trigger files carry the internal job secret **in plain text, committed in the repository**. That is the existing convention and it is not mine to change on my own — but anyone with the repo has the key to trigger any job on that box. The alternative is the trigger reading it from the machine's environment, the way the API process already reads its own secrets; the cost to the owner is setting one variable per box, once. **My recommendation: change it** — but it touches every job on the server, so it is Otto's hands and the owner's call, not a code task I would start unasked.

## 2026-09-24 — @Sober → @Porter: ✅ **TASK-461 DONE (2926/0).** `sm-jobs/group-series-extender.ps1` is in the repo, identical to its siblings down to the bytes — the owner can copy it beside the others and register it **daily at 03:30**, and discard the one he hand-wrote today. **The census is clean:** six jobs, six triggers, none pointing at anything stale — so there was one hole and it is shut, with a test that now catches both an undeployable job and a trigger aimed at a job that no longer exists.
📖 **The plaintext-secret decision, with the real cost, for the owner and Otto** — Jason reported it, changed nothing:
- **What it means today:** all six triggers carry the same secret in the repository, so anyone with repository access can run the day-end cut, the revenue post and the digests on that server. Rotating it means editing six files and re-copying them all.
- **The fix:** each trigger reads the secret from the machine's environment instead of holding it — one line per file, nothing invented (the API already reads its own secrets that way).
- ⚠️ **The operational catch, which is the part worth reading:** the variable must be set at **machine level**, not user level — a scheduled task that runs "whether user logged on or not" cannot see a user-level variable, and the symptom is all six jobs failing at 03:30 with nothing visible until someone asks why the digests stopped.
- **And the honest part:** the secret is already in the repository's history for ever, so switching is a rotation *plus* accepting that the old one was exposed. My recommendation is still to do it — but it is Otto's hands and the owner's call, and it should be done deliberately rather than squeezed into another task.

## 2026-09-24 — @Sober → @Porter: **You were right to stop the re-run. Here is what the code says, honestly split into what I know and what I do not.**
**What I can state from the code:**
1. **The extender's work is bounded** — at most 8 new dates per series, one small transaction each. There is no runaway loop, and inserting rows cannot put a database into recovery mode.
2. ⚠️ **But the first run on an old box is the biggest run this job will ever do, and `sid` is exactly that box** — every group series nobody has closed, including ones abandoned months ago, gets up to 8 new bookings at once. That is the design and it is documented, but firing it blind at a shared cluster was not wise, and the reason it *could* be fired blind is mine: **I specified that job without a dry run**, while every other writing tool we ship has one.
3. 🔴 **The job's endpoint waits for the whole job before it answers — the identical mistake we removed from the LINE webhook three tasks ago.** The owner's error message ("the connection was closed") is what Windows says when the server goes quiet mid-request. **A long run and a dead process look exactly the same to him** — so that message on its own tells us nothing, and that is a defect in its own right.
4. 🔴 **Our API has nothing that catches a stray failure**, so when the database went into recovery and every query in flight failed at once, the process may simply have died. That would explain the silence — and it will happen again on that box for reasons that have nothing to do with us, since ~30 apps share the cluster.
**What I will NOT say:** that the extender is innocent. Nothing in it explains a cluster restart, and the timing is a plausible coincidence — but "unlikely" is not "didn't", and **the Postgres log is the evidence**. Otto has it; an OOM kill or "terminated by signal" there settles it in one line.
**What is being built (TASK-462), so the owner can run it safely:** a **dry run by default** that lists what it would create and writes nothing (the nightly trigger says "apply" explicitly, so the schedule still works and a hand-poke cannot write); limits so a first run can be taken in bites and says when it stopped; an endpoint that cannot sit on the connection; and a process that survives a database hiccup instead of vanishing.
**Until then: nobody runs it, on any box** — and when it is ready the owner's first action is the dry run, whose output also answers "how much would this have created?", which is a question worth having an answer to.
📋 **For Otto:** what our process does when Postgres restarts — does the pool reconnect, how fast, and what would a supervisor have shown? That plus the Postgres log tells us whether we were a victim or a cause.

## 2026-09-24 — @Sober → @Porter: ✅ **TASK-462 DONE (2944/0). The extender can now be run safely, and we found something in our own code that may have been the silence.**
📦 **The owner's order — please give him exactly this:**
1. Deploy (no database change).
2. **Dry run on `sid`** — the endpoint now writes nothing at all unless you ask it to, so this is safe: it returns the full plan (every series, its coach, the dates) and a total. **Read it before anything else** — on a box full of old test classes, that list is also the list of series he may want to CLOSE rather than grow.
3. Re-copy `sm-jobs/group-series-extender.ps1` — it now says "apply" explicitly.
4. Apply once by hand, and **read the outcome in the job history table, not in the PowerShell window** — that is the deliberate cost of the change below.
5. Only then register it nightly.
**Why the outcome moved out of PowerShell:** applying now answers immediately and records a row that either finishes or doesn't. A long run and a dead server used to look identical to him; now one leaves a finished row and the other leaves a row that never finishes — including when the database itself is what died, in which case the row stays unfinished for ever, which is the honest record.
🔴 **The thing worth telling the owner plainly:** Jason went looking for how a database hiccup could kill our API, and **found it in his own code from three days ago** — one line in the webhook change, where a "run this either way" helper actually re-throws, producing a failure nobody could catch. That is exactly the kind that ends the process — and it would explain "no HTTP response at all". **He cannot prove it fired that night** (we have no record of a LINE message at that instant) and he said so rather than claim the case closed. It is fixed either way, and the process now survives this class of failure instead of vanishing.
**Still not cleared:** whether the extender had anything to do with the Postgres restart. Nothing in it explains one, and the Postgres log settles it — that is with Otto.
📋 **For Otto, from the code (nothing changed):** our pool is postgres.js with defaults — 10 connections, 30 s connect timeout, no retry of our own; during a restart every in-flight query fails, the pool discards dead connections and reconnects on the next query, so the API needs no restart once Postgres accepts connections. Before this task an unhandled failure exited the process (code 1) — consistent with "no HTTP response"; now only a synchronous crash does. ❓ **Still open and it matters twice over: how many processes serve `/api`, and is there a supervisor (PM2/NSSM)?**

## Tanya (QA) -> @Porter — TEST-067 C/E/F/G done (LIVE cred — redacted by Porter). 2 defects; the E one is HIGH.
The credential blocker is gone — it was the STALE `project-docs` file; the live super-admin cred in
`H:/sm-test-access.txt` works. All four items ran. Full detail: `tests/TEST-067-req105-line-round.md`
(new "C/E/F/G round" section).

- **C (group clash) — PASS, happy + negative, live.** Proved the whole lifecycle on a throwaway series:
  empty group -> a private yields it (`yielded:true`, not yet a clash) -> a kid enrolls -> **`clash:true`**
  -> resolve-move clears it (`clash:false, yielded:false`, seat kept). Negative: a group WITH a live kid
  refuses the private (`409 SLOT_TAKEN`, names the class); empty/blank resolve bodies -> 400; missing
  booking -> 404 (no 500). FE clash logic 12/12 green. (swap-coach resolution not driven live — unit-covered.)
- **F (cancelled to bottom, faded) — PASS.** It is a pure FE sorter (`entitlement-order.ts`), no API surface;
  its unit suite passes (dead sink under a divider, live order stable, DROPPED/COMPLETED not dead).
- **G (malformed id -> 400) — PASS except two routes.** All id routes give 400/404, **but**
  `GET /api/group-series/:key` and `/api/other-series/:key` still return **500** on a malformed key ->
  **DEF-2 (minor):** the `:key` param is passed raw to `getOtherSeries` with no uuid guard; TASK-451's guard
  never reached these two series-key readers. For @Sober/@Jason.
- **E (camp per-coach) — windows PASS, but a HIGH rate leak -> DEF-3.** Per-coach windows + rates work
  (EK 10-12, Bank 13-15, sorted, each own rate). **BUT a `menu:camp` user with NO key 59 reads every coach's
  `teachers[].rateMinor` in full** (the legacy `teacherRates` map is correctly nulled). TASK-454 added a new
  rate field (`rateMinor`) that is not in the key-59 read-mask list `["rate","classRateMinor","teacherRates"]`,
  so the mask walks past it. **Coach pay is now visible to any Camp-menu staffer.** Write side is safe
  (`rateMinor` is in the body-fields check); it is only the READ. Fix is small — add the field to the mask, or
  mask the camp `teachers[]` at the mapper (check the booking DTO first so nothing legit gets nulled).
  🔴 **This is the one to route to @Sober now.** I will re-test.
- **D (extender)** — untouched; still the owner's hands, on hold behind the sid Postgres-recovery incident /
  TASK-462.

**Footprint — all cleaned.** Camp week CLOSED, restricted user DISABLED, both test group-series cancel-all'd,
3 trial bookings cancelled; calendar re-checked, zero live QA rows on 2026-11-30 & 2026-12-14. Cancelled
rows are CANCELLED residue (not hard-deletable by design). No real customer/teacher/family data written or
messaged; KKTEST fixture used for the probes. Demo LINE still left linked for the owner's repro; push blocked
til 1 Oct (nothing push-based attempted).

## 2026-09-24 — @Sober → @Porter: **Tanya found a real leak and she is right to hold `uat`. Both defects passed my review, and I want that on the record.**
**DEF-3 — what it means in plain words:** a member of staff who can open the camp page but has **not** been given the coach-pay permission can nonetheless see every coach's pay for those days. The gate on *changing* pay works; the gate on *reading* it had a hole. The cause is small and ugly: we keep **two lists** of "these are the pay fields" — one for reading, one for writing — and when the camp work added a new pay field a fortnight ago it was added to neither. There was even a test meant to catch exactly this, and it had quietly stopped covering the thing it was written for.
**What is being built:** the two lists become one, and — the part that matters — a test that walks everything we send to a browser and **fails the build the day anyone adds a new pay-shaped field without telling the mask**. So the next one fails for us in the morning, not for a customer's staff reading a colleague's salary.
**DEF-2** is the small one: two of the new series pages return an error page instead of a clean refusal when the address is malformed. Cause: our recent guard skips parameters named "key" — because one older page uses that name for a free-text setting — and the series pages happen to use the same word for something that *is* an id. Being fixed by deciding per page instead of per word.
**My part in both:** I reviewed the camp change that introduced the leak and did not ask the one question that mattered — *does this new field pass the pay mask?* — the same question I also failed to ask about its migration proof two days ago. Twice on the same task. That is a pattern in my reviewing, not bad luck, and the two walk-tests being built are the durable answer.
📌 **Thank you for the PM2 answer** — one process under a supervisor means the safeguard we built against overlapping messages really does cover that box, and an exit means "restarted", not "gone". I have told Jason to write that into the file so nobody re-opens the question in a month.

## 2026-09-24 — @Sober → @Porter: ✅ **TASK-463 DONE (2955/0) — the leak is closed and ready for Tanya's re-test.**
**For her (TEST-067 C/E/F/G):** a camp user **without** the coach-pay key now sees every camp coach's pay as empty — the coach, the hours and the day all still there; **with** the key, unchanged. The two series addresses answer a clean refusal instead of an error page when the address is malformed, and the Settings screen still saves and resets everything as before. Nothing to migrate.
**Two things worth telling the owner, because they are why this needed a task rather than a one-line patch:**
1. **The test that should have caught this was looking at the wrong thing.** It checked that a line of code did not appear in a particular shape — and the camp work wrote the same thing on one line instead of three, so it sailed past. It was never deleted or disabled; it simply stopped covering what it was written for. That is now the **fourth** time this week we have found a check that passed while the thing it guarded was broken, and every one is written down. The replacement reads what the system actually sends to a browser, so the next new pay field fails the build the day it is written.
2. **That same check immediately found a second one** — another pay field no screen sends today, which any future "just return the raw row" would have carried straight out. It is closed before that reader exists. That is the difference between fixing a leak and fixing the reason leaks happen.
**`uat` stays held until Tanya passes the re-test**, as the owner asked.

## Tanya (QA) -> @Porter — TASK-462/463 re-test: ALL PASS. 🟢 uat released on my word.
Detail: `tests/TEST-067-req105-line-round.md` (new "DEF-2 & DEF-3 re-test" section).
- **DEF-3 — FIXED.** A `menu:camp` user WITHOUT key 59 now reads `teachers[].rateMinor` = **null** and
  `teacherRates` = **null** (teacher + hours still shown). WITH key 59 unchanged (฿400/฿550). Regression clean:
  a non-holder also gets `null` on non-camp surfaces (DUO series `teacherRates`, calendar `booking.rate`), and
  a key holder still sees rates elsewhere (no over-mask). The unified list + walk holds.
- **DEF-2 — FIXED.** `GET /group-series/<bad>` and `/other-series/<bad>` now **400** (were 500). Settings
  routes fine: `GET /settings` 200, `/settings/:key` not 400.
- **C regression — clean.** Full clash lifecycle after the pay-mask change: seat ⇒ `clash:true`; resolve-move
  ⇒ `clash:false, yielded:false`, seat kept. Unchanged.
- Note: TASK-463's walk also masks a second field `teacherRateMinor` that no DTO emits yet — can't be driven
  live, masked before any reader exists. Fine.

Footprint cleaned: `QA-C-reg` series cancel-all'd + trial cancelled (0 live rows 2026-12-21); test user
re-DISABLED; camp week stays CLOSED. **This is my PASS — go for the uat deploy.**

## 2026-09-24 — @Sober → @Porter: REQ-106 §2 — three answers from the code, and one of them probably IS the explanation.
**1. Does a super admin bypass role grants? YES, completely and by design.** Every permission check is *"is this a super admin, OR do they hold the key?"* — so **turning a permission off has no visible effect on a super-admin account.** If the customer tested with her own admin login, that alone explains "I turned it off and still see it". First question for her screenshots: **which account was she looking at?** (The user list shows who is a super admin.)
**2. Do grant changes take effect immediately? YES — no re-login needed.** The permissions are read from the database on **every request**, not baked into the login token. A change is live on the next page load, for that user, without signing out. (So "log out and back in" is not the fix, and if she *did* re-login and still saw it, that rules nothing in or out.)
**3. Which money is still unmasked on `uat` — and this is the important part: 🔴 `uat` does not have the money-permission work at all yet.** Both keys — the **freelance-budget** one and the **coach-rate** one — are in the batch that is still held for Tanya's pass. On `uat` today:
- the **coach rate** (course card, session popup, DUO, ECA/Group per-teacher rates, camp day rates) is visible to anyone who can open those screens — **there is no key for it on that build**;
- the **freelance ceiling / remaining** is visible to anyone with the Teachers page — same reason;
- price cards, discounts and posted-sale amounts are visible to whoever holds those menus, **by the owner's own decision** (he ruled those out of scope in REQ-102 §4);
- the reports/dashboard money is behind its menus only.
⇒ **If her complaint is about a rate or a budget on `uat`, nothing is broken — the feature simply is not there yet**, and it arrives with this batch. If it is about a key that *does* exist on that build (a discount, say), then it is a real defect and the screenshots will tell us which.
**So the three questions for her, in order:** which account (super admin?), which screen, and which permission did she switch off — by its exact name on the Roles page. With those I can say in one line whether it is (a) the super-admin bypass, (b) a feature not yet on `uat`, or (c) a genuine hole like DEF-3.

## 2026-09-24 — @Sober → @Porter: **You are right and I was wrong — thank you for checking me against the log.**
Keys 57/58/59 **are** on `uat` (log 2026-09-22: the whole batch live 09-23, migrated to 53, grants done). What is missing there is only TASK-446…463 — so the coach rate and the freelance budget **are** masked on `uat` today, **except the camp per-day rates**, which is exactly DEF-3 and ships with TASK-463. I stated a deployment fact from memory instead of reading the log entry; that is the one thing this workspace's own rules tell me never to do, and I have written it into SYSTEM-FACTS as a rule for myself: **before saying what a live box has, read the deploy log line.**
**REQ-106 §1 — the rental note in the teacher view. I have the answer, and it is NOT a permission she can grant.**
`BookingModal` renders the rental block as `{!scoped && <RentalSection …>}` — **the whole block is hidden for a linked teacher account** (the REQ-097 teacher view), deliberately, when that view was built. Inside it, the add/paid/remove doors are gated by the rental key — but that gate never gets a chance to matter for a coach, because the section itself is not rendered. ⇒ **No key exists that would make it appear. Switching permissions on will not fix it, and she should stop looking for one.**
**What the coach actually needs, and my recommendation:** the **gear**, not the money — the rental code and its remark ("helmet + knee pads, size S"), shown **read-only** in the teacher view, with **no paid/unpaid state and no buttons**. That matches the owner's own instinct elsewhere: a coach sees what he must prepare; what the family paid is the shop's business.
**Size: FE S, BE nothing** — the data is already in the payload the teacher's own calendar receives (the scope decides *which bookings* a coach sees, not which fields), so this is one read-only block and its copy. If the owner wants the paid state shown too, it is the same size — but I would not, and I would rather he says so explicitly than have me assume.
**One owner decision:** gear only (my recommendation) or gear + paid state. Say the word and I cut it.

## 2026-09-24 — @Sober → @Porter: ✅ **REQ-106 §1 cut — TASK-464 (Fern, S), folding into the held batch as the owner asked.**
A coach will see the rental item and its note, read-only: no price, no paid/unpaid, no buttons — exactly (ก). I have told Fern to pin the **absences** as hard as the presence, because the paid state *is* in the data she is handed (the teacher scope limits which sessions a coach sees, not which fields come back) — so "don't show it" is a decision the test has to hold, not a side effect of what happens to be available.
**One thing for the customer, since she went looking for a permission:** there was never a key to switch on. The rental block is hidden by the coach view itself, which was built that way deliberately — so no amount of granting would have worked, and she can stop hunting. After this ships it simply appears for coaches.
I will ping you when it is green, for the `sid` redeploy → Tanya → the single `uat` deploy.

## 2026-09-24 — @Sober → @Porter: ✅ **TASK-464 DONE (578/0) — the coach will see the gear.** One grey line, *"Equipment to prepare: Full Set"* with the note under it, and that is all: no price, no paid/unpaid, no buttons. An admin's view of the same session is unchanged.
**Everything in the held batch is now green on both sides:** BE **2955 / 0** (migrations 56) · FE **578 / 0**. That covers REQ-105's group clash, camp per-coach windows and voucher ordering, the LINE webhook work, the coach-pay leak DEF-3 and its guard, the malformed-address refusals, and this rental line.
📦 **So it is ready for the owner's `sid` redeploy → Tanya → the single `uat` deploy**, whenever he wants it. The deploy notes he needs are unchanged from what I sent: `db:migrate` → verify **56**, the index rebuild wants a quiet window, and the extender's first run on any box should be the **dry run** before anything is applied.
**For Tanya on this one:** as a linked coach, a session with a rental shows the item and note only; the same coach on a session without one sees no box at all; an admin sees the full rental section as before — worth one look in Thai too.

## Tanya (QA) -> @Porter — REQ-106 (TASK-464) coach rental view: PASS. 🟢 uat released.
Detail: `tests/TEST-068-req106-coach-rental-view.md`. Fixture: Lewis · Aileen · Private SURFSKATE ·
2026-09-28 10:00, rental "Full Set" (Surfskate), unpaid, ฿200.
- **Coach WITH rental — PASS (EN + TH).** One grey line "Equipment to prepare: Full Set" / "Surfskate", and
  nothing else: NO price, NO paid/unpaid (the rental is UNPAID and the coach still sees no payment state), NO
  buttons but Close. DOM-verified: `data-rental-gear` present, no ฿/บาท, buttons = [Close]/[ปิด] only. TH:
  "อุปกรณ์ที่ต้องเตรียม: ชุดเต็ม".
- **Coach WITHOUT rental — PASS.** No box at all (`if(!rental) return null`; unit-covered, 27/27 green).
- **Admin, SAME session — PASS (unchanged).** Full editable section: "Rent 200 / Full Set (Surfskate) ·
  unpaid" + Mark paid + Remove. The coach masking is the scoped-only change (`BookingModal:680`).
- Unit: rental-gear + rental-row + teacher-scope = 27/27.

**This PASS releases the single uat deploy.**

### Evidence — smart-scheduler/project-docs/qa-2026-09-24/
- `req106-coach-with-rental-en.png` — coach EN, gear-only, Close only, no price. Proves the §1 masking.
- `req106-coach-with-rental-th.png` — coach TH, "อุปกรณ์ที่ต้องเตรียม: ชุดเต็ม", ปิด only.
- `req106-admin-rental-section.png` — admin, same session, "Rent 200 · unpaid · Mark paid · Remove" — the
  full section unchanged (the contrast).

Footprint: coach fixture `qa-teach-97103` (Lewis) — reset pw + enabled + menu:calendar for the test, then
restored (menus cleared, DISABLED). Its pw is now `(reset — see owner credential file)` (old hash unrecoverable), account inert.
No bookings/rentals changed; all reads.

## 2026-09-25 — @Sober → @Porter: **Your read is exactly right, and I verified every step of it. TASK-465 cut (S).**
**The cause, in your words and confirmed in the code:** the job asks for the "weeks ahead" setting and is handed a small object describing it — value, whether it is the default, and why — and then tries to turn that whole object into a number. The result is "not a number", the horizon becomes a nonsense date, no date is ever before it, and the run reports **zero created, cheerfully**. `weeks: null` in the output is just how a "not a number" prints in JSON — which is why it read as empty rather than broken.
**It is the only place in the codebase that makes this mistake** — seven other callers read the setting correctly — and the compiler cannot catch it, because turning *anything* into a number is legal. So the fix is two parts: correct the line, and then make the mistake impossible for the next person, rather than trusting them to remember.
**Your other two questions, answered:**
- **`truncated: null` is correct** — that field stays empty until a limit is hit, and none was. Not a second bug.
- 🔴 **`series: 0` is real, and it is the more useful finding.** That number is counted from the group classes themselves, *before* any date arithmetic — so **`uat` genuinely has no open group series**. Even once this is fixed, the extender will create nothing there until somebody makes one. Worth telling the owner so he does not read the fixed run as another failure.
**What he should expect after the fix** (I have asked Jason to state it exactly): a real horizon date instead of the nonsense one, a real number of weeks — and still **zeros for created**, because there is nothing to extend on that box. That is a healthy run. On a box that *does* have an open group class, the plan will name it with its coach and dates.
**And the part I want on the record:** the tests for this job **mocked the setting**, so they asserted the horizon the mock produced and could never have seen this. That is the same family as everything else we have found this week — a check that agrees with itself. The new test goes through the real path, and I have asked Jason to confirm it **fails on today's code** before his fix.
Nothing else in the `uat` deploy is affected, and the owner is right to leave the extender unscheduled until this lands.

## 2026-09-25 — @Sober → @Porter: five answers on the `uat` relink dry run, and **one of them is a stop sign before any `--apply`.**
**(1) `linked none` on all 205 — yes, they see the account's DEFAULT menu, and no, nothing regressed.** A per-user link is only ever written when someone links their account or taps the language toggle; **this deploy wrote none**, and the sweep is a manual tool nobody has applied. Those 205 have been on the default menu since before the deploy, and they still are.
**(2) 🔴 This is the stop sign. The dry run proves our DATABASE has menu ids; it does NOT prove those menus still exist on that OA.** The tool compares "what is this chat linked to" against "what our settings say it should be" — both of which it can see — and `0 blocked` only means our settings had an id for everybody. **The customer cleared our menus off that account on 09-05.** If those ids are the cleared ones, an `--apply` would try to link 205 real people to menus that no longer exist — 205 failures at best, and no way to tell from this output. ⇒ **Before anything: `bun run line:inspect-menus` on that token** (read-only, prints the account and every menu actually on it). If the ids our settings hold are not in that list, the answer is not "apply" — it is "publish first, with the customer's artwork", which is REQ-077 and the owner's decision.
**(3) What happens to a real user today, with 446/452 live:** if a menu id is dead, the link attempt fails — **and it is caught and logged, not shown to the user**. A parent linking their account still gets their children's names; the language toggle still confirms in the new language. They simply stay on the default menu. So there is no user-visible regression waiting on that account, which is why (2) is a decision rather than an emergency.
**(4) Confirmed, and it is the same point I flagged twice:** most of those 184 customers are EN, and **there is no English "known" menu** — never published, because an id without artwork renders blank. So an apply would put English parents on the **old blue English menu**. Thai parents would get the orange one. That is not a bug to fix in code; it is artwork plus one publish, the owner's call.
**(5) The apply he already ran (runId `bb630bf6…`): it created nothing, and that is expected twice over** — the horizon bug (TASK-465) makes every plan empty on every box, and `uat` has no group series anyway. It wrote a `job_runs` row and nothing else.
⚠️ **And here I owe him a correction:** I told you the owner should "read the outcome in `job_runs`" — **and there is no endpoint that shows him that row.** A job's own log line reports clashes and truncation, but the finish is only in the table. So today his only honest options are to read that row directly on the box, or to look for the absence of an error in the app log. **That is a gap I created by moving the outcome out of PowerShell without giving him a window into it** — I will close it in the TASK-465 round (a tiny read-only "last runs" view of `job_runs`), unless the owner would rather read the table.
**Held, correctly:** no `--apply` on the real OA. `LINE_OA_WRITE_ALLOW` being unset there is exactly the belt we built for this.

## 2026-09-25 — @Sober → @Porter: thank you — that settles it, and it also tells us our own tool was misleading.
**What the inspect proves:** all four stored ids are dead on that account, so **every link and every language toggle on the real OA is calling LINE with an id that does not exist** — caught and logged each time, invisible to the parent, but it is a steady drip of failures in the log and a settings table that claims menus we do not have.
🔴 **The part that matters more than the noise: the relink dry run said `expected teacherTH / parentTH / parentEN` for 205 real people — for menus that are not there.** The tool the owner uses to decide whether to apply cannot currently tell "the id is right" from "the id is dead", and that is precisely the report that nearly justified an apply onto 205 customers. **A decision tool that cannot see the difference between a plan and an impossible plan is the defect here**, not the log noise.
**Three options, sized:**
1. ✅ **Recommended — S: the sweep checks the stored ids against the account's real menu list ONCE per run** and reports a dead one as **BLOCKED** (the outcome it already has for "never published"), so it can never again promise a link it cannot make. Read-only, writes nothing, and it makes the next dry run on any box honest by itself.
2. **XS, and it is data rather than code — the owner clearing those four ids on that box.** Then link and toggle simply do nothing there (no id ⇒ no call ⇒ no failures), which is the correct behaviour for an account with no menus. ⚠️ Worth it only if REQ-077 is far off, because **publishing will overwrite them anyway.**
3. 🚫 **Not recommended: having the code clear an id when LINE rejects it.** It writes to settings from an error path, and one bad afternoon on the network would erase working ids on a healthy account. The cure is worse.
**My advice:** take (1) whenever there is room — it is the tool telling the truth — and skip (2) unless the artwork decision is going to sit for weeks. Neither is urgent and neither blocks anything; say the word and I cut (1).

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-465 DONE (2964/0) — and it is almost certainly the answer to the `sid` incident. Please put this in front of the owner.**
**The setting bug had a second half, and the second half is the serious one.** Getting "not a number" for the horizon produced a nonsense date — and the job compares dates as **text**. Any real date sorts *before* that nonsense value, so the comparison that was supposed to stop the loop said "keep going" **for ever**: measured at 360,000 turns in a third of a second, marching into the year 8940, filling memory, with nothing else able to run in that process.
- On `uat`, which has **no** group classes, that loop had nothing to walk — so it looked like a harmless empty run. That is all the owner saw.
- On a box that **does** have an open group class — **`sid`** — the first call would never come back: **no HTTP response at all**, and memory growing until something on that machine kills a process.
⚠️ **That is precisely what happened on `sid`**: the trigger returned "the connection was closed" with no response, and the shared database went into recovery at the same moment — which is what the operating system's out-of-memory killer looks like on a box running thirty apps. **We cannot prove it from the code**, and Jason says so plainly; the proof would be in the machine's out-of-memory log or the Postgres log, which is Otto's. **But it is now the leading explanation, and it replaces "probably a coincidence".** If it is confirmed, the apology is ours: our job took that database down, and the extender was the cause after all.
**What is fixed:** the setting can no longer be misused — asking it to behave like a number now fails loudly on the first attempt, with the correction in the message, instead of quietly producing nonsense. The loop refuses a horizon that is not a real date, *inside the loop itself*, so the next caller is protected too. A run that cannot compute its horizon now fails and names the setting, rather than reporting a cheerful zero.
**Why our tests never saw it:** both test files for this job replaced the setting with a plain number, so they were asking a question production never asks. They now go through the real path. That is the same lesson as the rest of this week, in the place it cost the most.
📦 **For the owner, after deploying:** dry run on `uat` should read **`weeks: 8`, `horizon: "2026-11-20"`** (today + 56 days) — those two fields are the proof the fix is live — with **zeros for series and created, which is correct there**. 🔴 **`sid` must be dry-run first and only after this ships** — on the current build a run there is the loop above.

## Tanya (QA) -> @Porter — TASK-465 extender apply on sid: PASS (read-only; I did NOT trigger it).
Detail: `tests/TEST-069-task465-extender-sid.md`. Horizon 2026-11-20 (weeks 8). Owner's apply = runId 97aa638b.
- **4 of the 5 planned dates created, empty, matching:** ครามพราว 11-16 (Bank 17:00, 0/2); คราม&พราว 11-09 &
  11-16 (Camp 14:00, 0/2). All at the right weekday/time/coach/rate, amber empty-group tone.
- **The 5th — Balance Play Monday 11-09 — was NOT created, and that is CORRECT (brief check #3):** the Camp
  coach's 12:00 hour on 9 Nov is already held by a Private "Aiwa · Course · Balance Play (Group)" (LAST
  session). The extender can't put a group row on an occupied coach-hour, so it skipped that date and
  continued (TASK-456's "clashing date reported, run continues"). It SHOWS as the group date simply being
  absent — no BPM block at Camp 12:00 on 9 Nov, the Private stands alone. No `group.clash` flag (the group row
  was never created, so nothing yielded). I did NOT resolve it. Balance Play Monday 11-16 WAS created (0/3).
- **No duplicates, nothing past 2026-11-20** (max date 11-16 on all 3), other series untouched; follow-up dry
  run wouldCreate 0 confirms the horizon is fully stocked. **Admin calendar responsive — no hang** (the
  infinite-loop symptom did not occur).

🔸 **One observation (not a calendar defect):** the dry run's `wouldCreate: 5` over-counted by 1 vs the apply's
real 4 — the dry run listed BPM 11-09 but the apply legitimately skipped it (occupied slot). The dry run does
NOT pre-detect coach-hour conflicts, so a plan can promise a date the apply then skips. Net calendar is
correct (never double-booked); worth knowing when reading a plan. Sober's promised "last job runs" view would
surface the skipped date.

**Verdict: PASS.** Footprint: none (read-only).

### Evidence — smart-scheduler/project-docs/qa-2026-09-25/
- `task465-week-16nov-new-empties.png` — 3 new EMPTY group blocks on Mon 16 Nov (0/2, 0/3, 0/2).
- `task465-week-09nov-clash.png` — Mon 9 Nov: the Aiwa Private on Camp 12:00 (why BPM 11-09 was skipped); no
  BPM group there; คราม&พราว 14:00 created empty.

## 2026-09-25 — @Sober → @Porter: 🔬 **REQ-107 analysed — `specs/SPEC-092-req107-richmenu-v2-analysis.md`. Your read was right, and there is one finding that makes this round cheaper than it looks.**
**Your question first: ✅ `/register` already covers BOTH** — I checked the routes rather than assumed. It has "find the family by phone", "link this LINE account to it" **and** "add a child to my family" (the one writer, with the per-child cap). So sign-up and Add Student are already the same page, and §2 is **wiring the menu and the bot's reply to the LIFF we have** — not building one. **BE S.**
🔑 **The finding: bilingual artwork lets us delete half the menu model.** Today we keep a separate menu for Thai and English, and the only difference between the pair is the picture — the buttons do the same thing either way. One bilingual image makes the pair pointless, so we can keep **one menu per role** instead of one per role per language. That is worth more than the work it saves:
- it **permanently closes the "no English artwork" gap** I have flagged three times (English parents stranded on the old blue menu);
- it **removes the whole class of bug** where the language toggle moved someone onto a different menu family (TASK-446/452);
- and the real OA has **no menus at all** right now, so this is the cleanest moment there will ever be to do it — nothing to migrate, nothing to sweep.
⚠️ **The one thing bilingual artwork cannot fix is the chat-bar word** (the little label under the chat, today "เมนู") — one menu means one word for everybody. **That is an owner decision and I have added it to §5.**
**Sizes:** artwork + the family collapse **S–M** · teacher menu re-published as-is **XS** (rides the same publish run) · the LIFF wiring **S** · the four message formats **M** (four renderers, every byte the owner's) · the publish itself is the owner's hands with the account guard. **Total BE M+, no frontend, no migration.**
**Two things I need answered before anyone builds**, both in §5:
1. **Does that LIFF id point at OUR `/register` page, on the owner's Login channel?** If it is a page someone else made, §2 changes shape entirely.
2. **"Chat with Admin closes the rich menu"** — LINE has no way to force a menu shut. What we *can* do is publish the menu so the panel opens collapsed, plus the mute we already have. **Please say that back to the customer in those words** — if she means something else, the honest answer may be that LINE cannot do it.
📌 And one quiet recommendation: keep the typed-phone sign-up **working** while the menu stops advertising it. It is the door we re-opened last week for a parent who types their number unprompted, and a LIFF page that will not open on an old phone would otherwise leave them with nothing.

## 2026-09-25 — @Sober → @Porter: ✅ **Five tasks cut. And your "skipped-date hole" has a name now — it is worse than it sounded, so it goes first.**
🔴 **TASK-466 — the extender would undo an admin's cancellation.** It only looks at *live* sessions, so a future date that someone **cancelled** is invisible to it: if that was the series' last date, the job re-creates it the same night. The admin cancels a class, the job quietly puts it back, and the parents' morning reminder announces a lesson that was called off. It is fixed before the extender is scheduled anywhere — which is still nowhere, correctly.
**TASK-467 — my gap, closing it.** I moved a job's outcome into a table and gave the owner no way to read it. He gets a one-file "did last night's job finish?" trigger beside the others, and an unfinished run will *look* unfinished, which is the whole point of the design.
**REQ-107, in the order you set:** **TASK-468** (contract first — one bilingual menu per role, the new cells, `เมนู | Menu`, teacher menu re-published as-is; **the "closes the menu" behaviour is held** until Khwan answers) → **TASK-469** (the sign-up cell and Add-Student reply point at the `/register` page we already have; the LIFF id comes from the environment so a demo parent can never be sent to the customer's real page; the typed-phone fallback stays alive but unadvertised) → **TASK-470** (the four message formats).
📌 **One thing to tell the owner about TASK-470 before Tanya sees it:** the customer's own sheet uses `25/09`, `27.10.26` and `@ 10.00` — **three date styles, none of them our house `DD-MM-YYYY`**. They are her messages and her choice, so we copy them exactly; but he should see the inconsistency now rather than discover it in a screenshot, in case he wants one style everywhere.
**Two small questions I have answered provisionally** and will confirm when she replies: removing the leave-quota count is on the *message* only, not the parent's view everywhere; and "do not mention moves to the end of the course" is about wording, not about changing what leave does. If either is wrong, say so before TASK-470 finishes.

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-466 DONE (2978/0) — the extender can no longer undo a cancellation.** A date the series has *ever* had — cancelled, attended or live — is now a date it will not create again; a series cancelled in full stays cancelled; and the class it copies forward is still what the class looks like today, not what a cancelled row said.
**Two things worth the owner's time, both of which Jason reported on himself rather than being caught:**
1. **His mutation testing briefly lied to him** — he ran it with the wrong baseline, which made a check *look* like it worked when it had not. He noticed, said so, and fixed the cause. We already had a rule for the opposite failure; now we have one for this.
2. **The real reason the check had failed is the part I would want him to know:** our test fixtures pretend to be the database, and they ignore *what was asked of them* — so a change to the question we ask the database was invisible to every test we had. That is why this defect could sit there while the whole suite stayed green: **the fixtures agreed with the bug.** It is fixed for this job, and it is written down as a rule for the next one.
▶️ Jason is on the job-runs view (my gap), then REQ-107's first contract.

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-467 DONE — the owner can now see whether last night's job finished**, with one line: `powershell -File sm-jobs\job-runs.ps1`. `success` with a finish time means it finished; **`-- NOT FINISHED --`** long after it started is the "the process died mid-run" signal we built the whole outcome-in-a-table design for. My gap is closed.
📌 Worth passing on: my own task text broke one of our rules (I gave the route and its trigger different names, when the rule is that a trigger calls a route with its own name). **Jason kept the rule and renamed the route rather than adding an exception** — "an exception by name is exactly the bet we lost last week". That is the right order of loyalty, and I would rather he does that every time.
✅ **TASK-468's contract is confirmed and building** — one bilingual menu per role. 🔴 **One correction he made to me, and it matters for the owner's runbook:** I said the old "wrong menu family" case would become impossible. It does not disappear — it becomes **the expected result of the first sweep after publishing**, because every existing follower is still on an old menu. So when the owner runs the sweep and sees ~all followers listed as "variant", **that is success, not a fault.** Deleting that label, as I had assumed we could, would have relabelled 205 real chats as "not ours" — which is false and would have read as an emergency.
📦 **His publish order, and the last line is the one to hold to:** deploy → publish the three menus on the demo → dry-run the sweep (expect everyone as "variant") → apply → Tanya → the same on the real OA with the account guard → **and only then delete the old menus.** Until the sweep has run, the old ids are what keeps every existing chat working.

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-470 DONE (3010/0) — the four message formats are in, every byte from her sheet.** Five things need the OWNER, and one of them is a genuine conflict with an earlier decision of his:
1. 🔴 **The leave confirmation no longer names the child.** Her sheet writes it that way; **our earlier ruling (TASK-135) said the child's name must be there**, precisely so a parent with three children knows which one was excused. Her sheet overrides it only if he says so. **This is the one I would ask him about first** — it is a safety line, not a style one.
2. **The "an admin will reply 🙏" line is gone from the command list** — built as her sheet says, and the Chat-with-Admin button is on both menus, so a person is still one tap away. If he wants the reassurance back in words, it is one line.
3. **Two of her Thai cells contain English text.** Copied exactly, as instructed — he should see that before Tanya screenshots it.
4. **Three date/time styles** (`25/09`, `27.10.26`, `@ 10.00`) against our house `DD-MM-YYYY`, as I flagged when cutting the task.
5. **"Duo" in her example line comes from the subject's own name**, not from anything we add — so it appears only where a programme is actually called that.
📌 **And one thing that made itself useful:** her list advertises "My Course" and "Request Leave" as typed commands — and **they were not commands at all.** A guard we built for a different reason caught that we would have printed instructions that do nothing. They work now.
**My own ruling on a question he does not need:** her course lines contain no translated words, so printing them in both languages would have doubled the message for no reader's benefit. The heading is bilingual; the course lines appear once.

## 2026-09-25 — @Sober → @Porter: ✅ **REQ-107's backend is COMPLETE — 3021 / 0.** All three: one bilingual menu per role (468), the sign-up and Add-Student links (469), the four message formats (470). No migration. Nothing on the frontend.
⚠️ **One thing about my own checking, since you rely on these numbers:** my first verification run reported thirteen failures and I said so. It was wrong — I had measured a tree that was still being written. Three clean runs since, all identical to his. I am recording it because a review that reports a number it only took once is not a review, and I hold the engineers to exactly that.
**Two decisions inside the work that the owner may hear about later, so here they are now:**
1. **The sign-up link is fetched when the parent taps, not baked into the menu picture.** It means a menu published from the wrong machine can never send a parent to the wrong LINE account — the same protection as the account guard we added last week, one layer further in. It costs one extra tap, and if the link is not configured the button simply falls back to the old "type your phone", so the door can never be dead.
2. **If the whole thing is deployed before the new menus are published, nothing breaks** — Thai chats behave exactly as today, and English chats get what they already had. That is deliberate, and it is what lets the owner deploy and publish on different days.
📦 **The publish order stands as Jason wrote it, and the last line is the one to hold:** deploy → publish the three menus on the demo → sweep dry-run (**everyone showing as "variant" is success, not a fault**) → apply → Tanya with screenshots → the same on the real account with the guard → **remove the old menus LAST.** Until the sweep has run, the old ids are what keep every existing chat working.
**Still with the owner, unchanged:** the five wording items from TASK-470 (the leave confirmation dropping the child's name is the one I would ask about first — it overrides his own earlier ruling), and Khwan's answer on "closes the menu".

## 2026-09-25 — @Sober → @Porter: ✅ rulings taken — **TASK-471 cut** (the child's name goes back into the leave confirmation; the other four stay as built) — and 📦 **the runbook is written: `RUNBOOK-richmenu-v2-demo-publish.md`.** I will tell you the moment the name fix is green.
**The runbook is written for the owner to read once before he starts**, and three things in it matter more than the commands:
1. **Step 1 changes nothing visible, on purpose.** With the code deployed but the menus not yet published, Thai chats behave exactly as today and English chats get what they already had — so he can deploy today and publish tomorrow without anything hanging in between.
2. 🔑 **In the sweep's dry run, nearly every follower will read `variant` — that is SUCCESS.** It means "holds one of our menus, but not the one it should have now", which is true of everybody until they are moved. I have put that in bold in the file, because a list of 200 rows all flagged with the same word reads like an alarm to anyone who has not been told.
3. 🔴 **The old menus are deleted LAST.** Until the sweep has moved every chat, those old ids are what keep them working; deleting first leaves people with no menu at all. It is the final step in the file and it says so twice.
It also carries the prerequisites (three images at fixed paths — a missing one refuses the run before LINE is touched; the right token, the right LIFF, the allow-list) and a short "if something looks wrong" list, including the one we have already lived through: **a read-only command will happily report on the wrong account**, so the first instruction is to check the header names the demo OA before doing anything.

## 2026-09-25 — @Sober → @Porter: ✅ **The name fix is in and green — 3022 / 0 (verified twice). REQ-107's backend is complete.**
The leave confirmation now reads `Record Leave: Feen — FRI 25/09 @ 16:00 : …` / `บันทึการลา : Feen — …`, in the shape the earlier ruling set, with the customer's other words untouched.
📌 **One improvement on the old behaviour, worth telling the owner because it is exactly the case his ruling was about:** the name is written by the same rule every other message uses — so it shows the child's nickname, and **a DUO session names both children**. His reason for keeping the name was that a parent with several children must see which one was excused; a class with two of them in it is precisely where the old code would have named only one.
**The line is also now hard to undo by accident:** it has been decided in opposite directions twice, so the code carries a note saying which way, on whose word, on what date, and not to change it back to the sheet — and a test keeps that note in place.
📦 **So: the demo-OA runbook is ready to run whenever the owner has the three images** (`RUNBOOK-richmenu-v2-demo-publish.md`). Nothing else is waiting on us — the remaining open items are all his or Khwan's: the artwork, her answer on "closes the menu", and whether she wants the date styles and the English-in-Thai cells changed once she sees Tanya's screenshots.

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-472 cut — the images get prepared by us, not by the owner.** Exact LINE sizes, under the 1 MB cap, at the runbook's paths, with her originals stretched as he ruled. If Khwan sends full-size files later they drop straight in.
🔑 **I have added one thing to that task that is worth more than the resizing:** nothing in our system currently checks that **the picture and the tap areas agree**. The image is what a parent sees; the definition in code is what LINE actually acts on when they touch it. If those two drift — a taller image, a cell moved — the result is a menu where pressing "Check in" does something else, and no test would say a word. From this task on, a mismatch fails the build.
**On your teacher-file question — there is a better answer than picking a language.** Our teacher artwork is **generated by a script**, not drawn by hand: the labels come from the same place the bot's own words do. So we can make the teacher menu **bilingual too**, with its cells exactly where they are today.
⚠️ **But the owner said "the teacher menu keeps its existing artwork and cells"**, and regenerating the labels keeps the cells while changing the picture. **So it is his call, and it is cheap either way:** bilingual (my recommendation — the coaches' menu then reads like everyone else's) or the current Thai image resized, which is a one-line fallback. Jason builds the bilingual one meanwhile so a "no" costs nothing.
📌 And a note for the runbook's sharpness check: the stretched parent images will be judged on Tanya's demo screenshots, as the owner wants — if they look soft, the fix is her originals, not our code.

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-472 DONE — the artwork is ready and the runbook's prerequisite is met.** Three files, exact LINE sizes, all under the limit, at the paths the publish expects. The teacher menu is built bilingual with its cells untouched, and the Thai-only version is a one-line swap if the owner prefers it.
**Two things for him:**
1. ⚠️ **Her 6-cell image needed real work to fit** — stretched it is 2.67 MB against LINE's 1 MB limit, and even a reduced-palette version was still over. It now fits at 0.59 MB by cutting the colour depth, and Jason's judgement is that it reads the same side by side. **Tanya's screenshots are where that gets confirmed** — if it looks flat or banded, the answer is Khwan's full-size originals, not more compression.
2. 📌 **One file sits at 98 % of the limit** (the small sign-up menu). It passes today. If Khwan sends new originals, that is the first one to re-check — and our own test will refuse it before LINE does, which is the point.
**What made this task worth its size, beyond the images:** we now check that the **picture and the buttons agree**. Until today nothing did — a menu image could drift from where the taps actually are, and a parent pressing "Check in" would get something else with every test still passing. That now fails the build.
📦 **So the demo publish can run whenever the owner is ready** — `RUNBOOK-richmenu-v2-demo-publish.md`, unchanged. Open items are all his or Khwan's: the teacher picture (bilingual or Thai-only), her answer on "closes the menu", and whatever she says after seeing the screenshots.

## Tanya (QA) -> @Porter — REQ-107 rich menu v2, demo OA phone: PASS on every driven check.
Detail: `tests/TEST-070-req107-richmenu-v2-sid.md`. Demo OA @125vuzsj, linked 0900000092 → customer 6-cell.
Chat bar = `เมนู | Menu` ✓. All 6 cells tapped, both languages, replies free (push at quota, not needed).

**Customer 6-cell — all PASS:**
- คอร์สของฉัน: new format `[Remain: x/y] *EXPIRE: dd.mm.yy`, **leave-quota removed** ✓
- เช็คอิน: "No class today" (no class today for this parent); the "Pick class 👇 / Program / Teacher @ time"
  format verified via the leave flow's identical block ✓
- แจ้งลา: Which child → Pick class → **confirmation NAMES the child** ("บันทึกการลา : asda — SAT 24/10 @ 15:00 :
  Balance Play (Group) / Teacher Camp"), and does **NOT** say "moves to the end of the course" ✓ (TASK-471
  ruling met; GROUP ⇒ one name, DUO-both not exercised — no DUO fixture)
- เพิ่มนักเรียน: LIFF link `liff.line.me/2011571495-uCrah47D`, TH + EN ✓
- ภาษา/ช่วยเหลือ: "Switched to English ✅" + short command list, and 🔑 **the MENU PICTURE does NOT change on
  toggle** (only the bot language + chat-bar label) ✓
- คุยกับแอดมิน: admin/mute bilingual + "(type: reopen)"; reopen un-mutes ✓ (menu stays shown — the "closes
  menu" hold correctly not applied)
- Typed "My Course" → course list; typed "Request Leave" → leave flow ✓ (#3)
- Image sharpness (#5): the 6-cell picture is crisp/legible — you judge from the full uncropped shot.

**Not driven from this one linked phone (offered/explained):**
- #1 unlinked 2-cell menu + Sign Up — this phone is the linked customer; seeing the `unknown` menu needs
  unlinking the owner's demo account or a separate unlinked fixture. **On your word** I'll clear the LINE link
  → shoot the 2-cell + Sign-Up reply → owner re-links 0900000092 → customer. (The admin/mute half of #1 is
  already verified.)
- #4 teacher 2-cell + ตารางของฉัน — not reachable; this phone is the parent account, can't also be the teacher
  "New" chat. Needs a teacher-linked LINE login.
- #3 typed-phone-links — not re-driven to preserve the demo link; the fallback was proven in TASK-447/449.

⚠️ **Footprint to flag:** the แจ้งลา confirmation test marked **asda's 2026-10-24 Balance Play Group seat as
SICK_LEAVE** (reaching the confirmation completes a leave; it was over-quota → "admin unlock"). I could NOT
reverse it from the QA surface — `PATCH /status {action:confirm}` is a 200 no-op on a leave seat. **Needs an
admin restore.** Also: bot reply language left in EN (owner had TH — one-tap flip, menu picture identical).
**The demo link 0900000092 → customer is INTACT; no menus deleted; no push used.**

**Verdict: PASS.** 11 named screenshots under project-docs/qa-2026-09-25/ (see TEST-070).

## Tanya (QA) -> @Porter — REQ-107 follow-up (unlinked path + LIFF sign-up re-link): PASS. Demo restored.
Owner-authorised. Cleared 0900000092's link → tested unknown/sign-up → re-linked by phone (restores demo).
Detail appended to `tests/TEST-070-…md`.
- **Unlinked 2-cell `unknown` menu:** ✅ **สมัครสมาชิก / Sign Up** + **คุยกับแอดมิน / Chat with Admin**, bilingual,
  chat bar `เมนู | Menu`.
- **Sign Up ⇒ LIFF register:** ✅ replies with `liff.line.me/2011571495-uCrah47D`; the link opens the
  `/register` page inside LINE ("Register", phone field, EN|ไทย). 🔸 **Wording note:** the reply text says
  "Please click the link below to **add a student**" (same copy as เพิ่มนักเรียน) — a "register / sign up"
  phrasing would read better for a brand-new user. Link + page are correct.
- **LIFF sign-up end-to-end:** ✅ enter 0900000092 → "Found your family" (มิลล่า, มิลลิม, asda, temp) →
  "Link this LINE account" → "Registration completed ✅".
- **Re-link restores the demo:** ✅ phone back on the 6-cell customer menu; DB link `U287ecc7fd…` restored.
- **#4 Teacher 2-cell menu:** ⛔ NOT reachable — this phone is the parent account; can't be the teacher "New"
  chat, and I won't touch links on other chats. Needs a teacher-linked LINE login.
- **Bot language left in TH** (your instruction) ✅.

**Footprint:** demo link cleared then RESTORED (net no change); bot TH; 6-cell menu back; no menus deleted, no
push, no other chats touched. ⚠️ Still open from the first round: **asda's 2026-10-24 Balance Play Group seat =
SICK_LEAVE** (over-quota leave-confirmation test) — **needs an admin restore**; the re-link doesn't affect it.

**Verdict: PASS.** 6 new named screenshots under project-docs/qa-2026-09-25/ (2cell-menu, signup-reply,
register-page, familyfound, linked-result, relinked-6cell). Only open copy question: the Sign-Up wording.

## 2026-09-25 — @Sober → @Porter: ✅ **K3's question answered from the code, so nothing stops — TASK-473 cut as one set.**
**The mute does expire on its own: sixty minutes**, and `เปิดเมนู` still brings the bot back sooner for anyone who knows it. So a parent who taps Chat-with-Admin is never stuck — the bot returns within the hour whether or not they do anything. **Khwan's wording can drop the "(type: reopen)" hint safely**, and that is how it is being built. The words change; the behaviour does not.
**Two items in her list are bigger than they look, and the owner should know why:**
1. **Publishing the menus COLLAPSED means new ids** — so the demo needs a **second publish and a second sweep**, and in that sweep everyone will again read `variant`. **Still success**, same as the first time. The menus from run 1 then join the "delete last" list, after the second sweep.
2. **The publish report printing `undefined`** sounds cosmetic and is not: that output is the only thing an operator reads to know what actually happened on a real account. We are fixing it and pinning it, because a report that says `undefined` is a publish nobody can check.
**One thing I have asked Jason to check beyond her list:** she reported the teacher-name shape on the *check-in* pick; I have asked him to look at the **leave** pick too and align them, because two picks that drift apart is how the next inconsistency arrives. Likewise a long teacher name against LINE's 20-character button limit — pinned, so the next long name cannot silently truncate.
📦 I will update the runbook for the second publish once he reports what differs. Nothing else changes: Tanya re-checks only the changed items, then the real OA runs once.

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-473 DONE (3047/0) — and one thing in it needs to reach the owner before he touches anything.**
⛔ **The last step of the runbook I sent you was DANGEROUS, and it was my mistake. It is struck.**
The command I told him to run at the end — "delete the old menus" — **has no way to delete only the old ones. It removes every menu it recognises as ours, including the ones just published.** Running it after the sweep would have stripped the account bare and left every parent and coach with no menu at all. Jason found it while reading for something else; **nobody has run it**, and the runbook now says, in plain words, *do not run this command*, with the reason.
**My ruling: we do not build a "delete only the unused ones" mode unless the owner asks.** Old menus that nothing links to are clutter, not a hazard — no chat can reach them and the account works perfectly with them sitting there. **An unused menu costs nothing; a wrong instruction costs everything.** If he wants the account tidy later, it is a small job.
📌 **The runbook is also corrected on something he WILL see:** after the second publish, the sweep will call the existing followers **`stale`** rather than `variant`. **Both mean success and both get relinked** — but I had told him to expect one word, and a man told to expect one word and shown another stops, correctly. That is fixed in the file.
🔴 **And Khwan's K4 was the smaller half of a real defect:** she reported the teacher name on the *check-in* pick. I had asked Jason to check the *leave* pick too — and it had quietly diverged, sending only `24/10 15:00` with no class and no teacher. Fixed in the same pass. That is why the sibling gets checked even when the customer only names one.
Everything else from her round-2 list is in, including the collapsed menus and the new admin reply. **The demo republish can run whenever he is ready** — same runbook, with step 7 struck and the `stale` note in place.

## 2026-09-25 — @Sober → @Porter: ✅ **K5 cut as TASK-474, and your guess on midnight is right — here is why, plus the one thing the owner needs to know before he picks a number.**
**Midnight: same day only, as you guessed.** The check-in only ever looks for a class *dated today*, so a window running past midnight would not start working at half past twelve — it would quietly match nothing at all. The guard stays and the arithmetic is clamped to the end of the day.
🔴 **Day-end: this is the real constraint, and it limits the feature more than the setting does.** Our day-end run settles every confirmed class that has already started — marking it attended or missed — and that settlement **moves the family's credit**. So a four o'clock class is already finished and paid for by the time the evening run has gone through, and a late window stretching past that is open over a session the shop has closed. **My ruling: after a session has been settled, a late scan gets the ordinary "too late" answer and changes nothing** — in particular a missed class must not turn back into an attendance hours later, because that re-opens a consumed credit after the day's books are shut.
📌 **So tell the owner plainly before he chooses a value:** the late window is only real **between the class ending and the day-end run**. On a box where that run is at 17:30, setting two hours does nothing for an afternoon class — it helps an evening one. That is how the design works, not a fault, and he may want to pick his number with that in mind (or move the run, which is a separate conversation).
**Default is 0, so nothing changes for anybody until he sets it** — and the tests go through the real settings path, not a stand-in, which is the specific trap that cost us this morning.

## 2026-09-25 — @Sober → @Porter: 🔬 **REQ-108 analysed — `specs/SPEC-093-req108-shopfront-qr-checkin.md`. The credential question has a better answer than any of the options, and your planning question has a useful one.**
🔑 **Planning first, because it unblocks Tanya today: REQ-108 changes no menu, no artwork and no message — it is a new page and new endpoints. So the REQ-107 demo republish should go ahead NOW.** She can check the menus, the collapsed panel, the new wordings and the late check-in while this is still being built, and nothing she looks at will move underneath her. REQ-108 then joins the same `uat` release as pure extra code, which is what the owner asked for without the menus waiting on it. (One ordering rule: REQ-108 uses K5's window, so it builds after TASK-474 lands.)
🔴 **Now the credential, and I want the owner to see the cost before he chooses.** A check-in is not a tick in a box: it marks the class attended, **consumes the family's paid session**, and **sends the parent a message about it**. So with a phone number as the only credential, a stranger who knows the number can see a family's children by name, **burn a lesson they paid for**, and make the parent's phone buzz about a class their child never attended. A phone number is not a secret — it is on every form and in every parent group chat.
⭐ **My recommendation is not on your list, and it is both safer and EASIER for the parent: the wall QR opens LINE, and LINE tells us who they are.** No phone typed, no child names shown to anyone, no code to wait for — the parent scans and taps their class. It uses the same identity check the registration page already uses. **And it quietly answers your question about LINE-linking:** the customer's own words are "the phone registered in the LINE system", so a linked family is the assumption — and a family that is not linked should be pointed at the sign-up QR we have just built, one screen away.
**If the owner wants the phone box anyway,** the honest version is phone + a six-digit code sent to the family's LINE. The plumbing is half-built already, but ⚠️ the code is a *push*, and pushes are the thing we ran out of on the demo account this week — so that route is a small build **plus** a quota conversation.
🚫 **What I will not do is ship the sheet as written without him saying so in words.** If he weighs it up and still wants phone-only, that is his call and I will record it in the task — but it should be a decision, not something we let happen by building what was drawn.
**Sizes:** BE M · FE M with the recommendation, no migration. Phone-only would be a day cheaper and is the reason we would be writing an incident report later.
**Everything else you asked:** today's sessions only inside the window (the same window as every other path — a shop-front check-in must not be able to do what the LINE one cannot) · camp days included, following camp's own credit rules · the attended state and the parent's notice are the **same act**, not a second implementation · and the printable QR lives on the Settings page, reusing the QR component the camp work already gave us.

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-474 DONE (3058/0) — the late check-in window is in, default 0 so nothing changes until the owner sets it.**
🔴 **One thing worth telling him, because it is the kind of near-miss that explains why these take a day rather than an hour:** the check-in link a parent taps **expires when the class ends**, and that expiry is checked *before* the new window. So the feature would have shipped looking perfectly implemented and **doing nothing at all** — every late scan answering "your link expired". Jason found it by asking what else stands between the parent and the behaviour, not by testing what my task listed. My task never mentioned tokens.
📌 **One small change Tanya will see even at the default:** scanning for a class that was already marked missed used to say *"not confirmed yet"* — which sent the parent looking for a confirmation that was never the issue. It now says "too late", which is the truth. That is a change on today's settings, so it belongs in her checklist rather than arriving as a surprise.
**And the thing for the owner before he picks a number, unchanged:** the late window is only real **between the class ending and the evening run that settles the day**. On a box where that runs at 17:30, two hours does nothing for an afternoon class — it helps an evening one.

## 2026-09-25 — @Sober → @Porter: **The owner is right and my recommendation was wrong — not outvoted, wrong.** TASK-475 is cut, contract first.
I assumed the parent is the one holding the phone at the counter. **The nanny and the driver are the answer to that**, and they do a great many of the drop-offs — identity through LINE would have locked out exactly the people the feature is for, and a code pushed to the parent fails for the same reason. I have written that correction into the spec so nobody reads my recommendation later without it.
**Your two questions:**
1. **Reversing a check-in needs no new door.** Cancelling an already-delivered session is allowed precisely so a mis-marked attendance can be undone, and it **demands a reason which is recorded**. So the sequence is: the parent's notice arrives within seconds, the admin cancels with a reason, and the reason stays on the record. I have asked Jason to confirm the same path **gives the credit back** — if it does not, that is a separate thing the owner should hear about rather than discover.
2. **A family with no linked LINE: your proposal, and one addition I think is the real answer.** Yes — the check-in works and there is simply no notice. But say plainly what that means: **guard 3 is the notice, so for an unlinked family there is no safety net at all** — the phone is the only credential and nothing tells them it was used. So I have asked for **the source of each check-in to be recorded**: when a parent says "we were not there", an admin can see at a glance that it came from the wall QR rather than from staff. One string, and it is the only evidence those families will ever have.
**One thing for the owner about the rate limit,** since it is the guard most likely to annoy him later: a limit tight enough to stop a stranger guessing numbers can also punish a front desk with five families arriving at once, and a limit that punishes the busy five minutes before class is a limit that gets switched off. Jason will say what he chose and why; if it feels wrong in Tanya's round, the number is easy to move.

## Tanya (QA) -> @Porter — REQ-107 ROUND 2 (TASK-474 + republish #2): PASS on driven items; K4 partial, K5 blocked, teacher n/a.
Detail: `tests/TEST-071-req107-round2-sid.md`. Demo @125vuzsj, 0900000092.
- **Item 1 collapsed:** ✅ menu starts CLOSED; `เมนู | Menu` bar opens the 6-cell.
- **K1 both directions:** ✅ blank line after "Switched to English ✅" AND after "เปลี่ยนเป็นภาษาไทยแล้ว ✅";
  TH also shows the TH command list; picture unchanged.
- **K3 Chat-with-Admin:** ✅ exactly `สักครู่นะคะ แอดมินจะเข้ามาตอบกลับเร็ว ๆ นี้นะคะ` / `Admin will talk to you
  soon.`, **no "(type: reopen)" hint**. Bot muted (free-text "test123" got no reply); `reopen` un-muted. 🔸 A
  rich-menu tap (คอร์สของฉัน) was STILL answered during the mute — only free text is silenced. (adb can't type
  Thai, so I verified un-mute via `reopen`, which still works; `เปิดเมนู` is the documented TH keyword.)
- **K0a Sign Up wording:** ✅ **FIXED** — "เพื่อ**สมัครสมาชิก**ค่ะ / …to **sign up**." (round 1 wrongly said "add
  a student"). Verified by unlink → 2-cell → Sign Up; re-linked after.
- **K4 pick Teacher name:** 🟡 PARTIAL — the leave CONFIRMATION carries it ("… Balance Play (Group) / Teacher
  Camp"), but I could NOT re-capture the multi-option pick BUTTONS: asda's two leavable sessions are now spent
  (I leaved them), and reaching another child's pick risks auto-completing a leave. Check-in pick needs a
  same-day class (none today).
- **K5 late check-in:** ⛔ NOT testable now — parent has **no class today** and it's **past 17:30 day-end**
  (~19:00). Neither the "missed class" nor "after class end before 17:30" path is reachable. Didn't touch the
  setting. Run it on a day with a booked class before 17:30.
- **Teacher menu:** ⛔ not reachable (parent phone).

⚠️ **Footprint / needs admin:** asda's **2026-10-24 AND 2026-10-31** Balance Play Group seats are SICK_LEAVE
(both over-quota, from the leave-confirmation tests) — I can't reverse them from the QA surface (confirm is a
no-op on a leave seat). **Please have an admin restore both.** Demo link cleared then RESTORED (detail
lineLinked:true, phone on 6-cell). Bot TH. No menus deleted, no push. 8 named shots qa-2026-09-25/req107r2-*.

Open for owner/admin: restore asda's 2 leaves; decide whether to re-run K4 button payload + K5 (needs a
same-day class before 17:30).

## 2026-09-25 — @Sober → @Porter: ✅ TASK-475's contract is confirmed and building. **But two of Jason's findings change what the owner approved, and he should hear them today rather than discover them.**
1. 🔴 **Guard 3 does not cover what he thinks it covers.** He approved "the parent's LINE notice fires at once, so misuse shows up immediately". In fact **the only message a check-in sends is the deduction notice, and that only exists when the session belongs to a course or a voucher.** A trial, a single session or an "other" booking sends **nothing at all** — to anyone, linked or not. And a **camp** day's notice goes out at the **evening run**, not at the scan. So the guard holds for course and voucher sessions of a linked family, and for nobody else.
   **My decision for this release: accept it, and record where every check-in came from** (that is already in the build) — because inventing a brand-new message to patch a guard he has not been told is leaky would be the wrong order. **If he wants a check-in notice for those sessions, it is his words and a small task.**
2. 🔴 **The remedy he was promised has a sting.** Reversing a false check-in *does* give the credit back — but it leaves the session **cancelled** and **tells the coach and the family that the class was cancelled**. So undoing a stranger's mischief announces something untrue to the very parent it was meant to protect. The other existing door — recording it as sick leave — returns the credit and sends no cancellation, but it means something different on the record. **Which of the two an admin should use is his call**, and I would rather he picks now than in the middle of an incident.
**Everything else is settled:** camp days list only those not already marked by staff (a wall QR must never overturn an absence a coach recorded), a suspended family gets the same neutral empty answer as an unknown number, and the rate limit counts **failed** lookups so it catches a guesser without punishing a front desk at ten to four.
📌 And a small pre-existing hole he should know exists, now fixed separately: **the old check-in link never refused a suspended family** — the LINE path did, the link did not. It is a one-line fix and I have cut it as its own task rather than let it disappear inside the new feature.

## 2026-09-25 — @Sober → @Porter: ✅ Tanya's two leftovers are cut as **TASK-477** (XS–S, folds into this round). And your question is answered: **yes, a menu tap being answered during the mute is intended** — a tap is an unambiguous request from the parent ("check me in"), and dead buttons would explain nothing; free text is what an admin is in the middle of answering, which is why that is what goes quiet. It is being pinned so it stays a rule rather than a memory.
🔴 **Your item 2 needs a correction before it is built, and it is the kind that looks fine in a screenshot.** The chip saying `นักเรียนของฉัน` is not a mislabelled "My Course" button — **it is a different command**: it lists the family's children. Renaming it as asked would put "My Course" on a button that shows children, which is worse than the inconsistency Tanya spotted, because then the label lies.
**My ruling: change what the chip does, not just its name** — the quick replies should offer the same four commands the new menu advertises (Add Student · My Course · Check-in · Request Leave), so a parent meets one vocabulary everywhere. Typing "children" still works for anyone who knows it. ⚠️ **That is a real behaviour change and it belongs in Tanya's re-check list** — the chip she taps will open the course view instead of the child list.
📌 On the two things still unverified: the K4 buttons and K5 both need a class today before the evening run, so her fixture class tomorrow morning is the right call — and the **teacher menu** is still unchecked, which is worth a coach's phone in that same round rather than a separate trip.

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-475 (the shop-front check-in, backend) and TASK-476 both DONE — 3087/0, migration 57.** Fern's half of REQ-108 is the page; I will cut it next.
📌 **Two things for the owner, one of which he should actually decide.**
1. 🔴 **A decision, not a detail — the DUO case.** A DUO lesson is one class shared by two families. If **either** family is suspended, the check-in is now refused — which is the safe default where money is concerned, and it is what we have shipped. **But say the consequence to him plainly: the second family's child is turned away at the door because the other family owes.** That is a conversation at the counter, not a technical outcome, and if he wants the innocent child let in it is a small change he should make deliberately rather than discover.
2. **The old check-in link had the same hole on camp days too** — Jason found the sibling I had not named. Both are closed, and the check now runs **first**, so a suspended family no longer gets the class details back inside the refusal.
📌 One smaller thing recorded rather than fixed: there are **two different wordings for the same suspension policy** in the system (the LINE one and the booking/sale one). We used the LINE wording here. It is worth one decision someday about which the shop actually says; it is not urgent and I have not spent time on it.
**Still open on our side:** Tanya's two leftovers (TASK-477) and the shop-front page itself. Nothing is blocked.

## Tanya (QA) -> @Porter — asda leave cleanup: I did it the real-admin way. It's a 🔴 FINDING — no admin screen reverses a mistaken leave.
Logged into sid frontoffice as super admin (credential: see machine.local.md pointer — redacted by Porter), tried every relevant screen for asda's 24/10 &
31/10 Balance Play Group leaves. **None can return a leaved session to CONFIRMED.** Detail: `tests/TEST-072-…md`.

Screens I tried:
1. **Calendar → group session (booking detail):** roster shows asda ON LEAVE; the session ⋮ = "Record
   leave/sick" + "Move session" (create/move only); the badge/name give no per-seat un-leave.
2. **Bookings/Students → Manage plan:** the per-session ⋮ on an ON LEAVE row = only **Edit** + **Mark absence**
   — no restore. Course buttons = Pause/Cancel/Add-extra/**Insert make-up** (adds a NEW session; original stays
   leaved).
3. **Deduction History:** read-only.
4. **"Unlock (admin)" / "Lock again":** the only leave-related control — re-opens the RESCHEDULE QUOTA, does
   NOT restore the session.
5. **API:** `PATCH /status {action:confirm}` = 200 **no-op** on a leaved seat.

Root cause (src, to help the fix): two doors CREATE a leave and there's no reverse door
(`scheduler.service.ts:2998`); and `confirm` short-circuits on `confirmedAt` without clearing SICK_LEAVE
(`:3462-3464`), so it's inert on a previously-confirmed seat.

🔴 **The finding:** a shop admin cannot fix a parent's wrong "แจ้งลา" tap — once leaved (esp. over-quota),
nothing returns the session to CONFIRMED. Recommend a BE+FE task: a per-session **"Undo leave / restore"**
admin action (clears SICK_LEAVE, refunds the leave-quota, re-holds the slot) on the roster AND the plan
editor, plus fixing the `confirm` short-circuit.

Footprint (still open, BECAUSE of this gap): asda 24/10 (`793f2aad`) & 31/10 (`7ce723ba`) stay SICK_LEAVE on
the demo — no admin way to clear them on this build. They'll clear when the reversal ships, or the owner can
fix the two rows in the DB.

Evidence (§1b): `finding-manageplan-onleave-menu.png` (ON LEAVE ⋮ = Edit + Mark absence, no restore),
`finding-leave-course-cards.png` (Unlock(admin)/Lock again = quota only). See TEST-072.

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-477 DONE (3097/0) — Tanya's two leftovers are closed, and REQ-107 round 2 is finished on the backend.**
- The un-mute reply now speaks the chat's language with the blank line, like everything else.
- The chips now say **and do** the menu's four commands.
⚠️ **For Tanya's re-check list, in her terms:** the third chip under the menu reply **used to list the children and now opens the course view**. Typing "children" still lists them. That is the behaviour change I flagged — it is deliberate, and she should tap it rather than trust the label.
📌 **Your question is now a rule rather than my opinion:** a menu tap is answered during the mute, free text is not — pinned both ways, and pinned in the code's structure too (the mute gate exists only on the text path, not the button path). If anyone ever "fixes" that by silencing taps, the suite says no.
**What is left on REQ-108:** the shop-front page itself (Fern) — I am cutting it next. The backend, the guards and the provenance are all in.

## 2026-09-25 — @Sober → @Porter: **All three answers, and the first one is safe to give Khwan now.**
1. 🔑 **The URL for the poster — final, fixed, no token:**
   **`https://frontoffice.develyst.online/checkin/shop`**
   The host is not my guess: it is the one the backend already uses to build check-in links on `uat`. The path sits beside the two check-in pages we already serve. **There is no token and there never will be** — the owner's phone-based ruling is what makes that possible, and it is what a printed poster needs, because paper cannot rotate. I have frozen the route in Fern's task **with a test that fails if it ever stops answering**, and written down why, so nobody tidies it away in six months.
   ⚠️ **One caution to pass on: she may PRINT today, but the poster should not go on the wall until we confirm the page answers.** A customer scanning a 404 in week one is worse than a poster that appears a few days later.
2. **The fastest safe path, and yes — split it:**
   - **REQ-107 can go to `uat` now.** It is verified apart from K4 and K5, and both are low risk: K4 is button wording, and **K5 defaults to zero, so it changes nothing until the owner sets a number.** Waiting on tomorrow's fixture class to ship the menus would be caution without a benefit.
   - **REQ-108's backend is done** — the guards, the provenance and the rate limit are all in and reviewed. **The only thing between the poster and a working QR is Fern's page**, which I have just cut as an urgent task.
   - 🔑 **Undo does NOT block the QR.** The two Undo questions are decisions waiting on the owner, not code we are missing — the existing reversal already works and already returns the credit. **QR first, Undo right after**, exactly as you proposed. Guards 1, 2 and 4 are built and are not being touched.
3. **The poster's wording — confirmed, and it errs in the safe direction.** It says "the phone linked with LINE"; our flow accepts **any family phone on record**, linked or not. So a parent whose phone is on file but whose LINE is not linked will still succeed — the poster promises less than we deliver, which is the right way round. 📌 And it quietly helps with the gap I raised earlier: an unlinked family gets **no notice** when a check-in happens, so a poster that nudges people toward linking is, by accident, pointing at the safer path.

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-478 DONE (586/0) — the shop-front page is built and the printed URL answers.** `https://frontoffice.develyst.online/checkin/shop`, no token, and the route is frozen with a test that fails if anyone renames it — and tells them why in the failure itself.
**So REQ-108 is complete on both sides.** With REQ-107 already verified, the only thing left before the poster can go on a wall is the deploy and Tanya's pass on the new page.
📌 **One thing worth telling the owner, because it is exactly the failure this feature could not afford:** Fern's first tests proved the four "nothing" cases *looked* the same — unknown number, no class now, suspended family, empty list. Then one of her own deliberate breakages slipped past all of them: a line that said "Phone not found" on a shape her tests never produced. **She replaced "these four look alike" with "the page is not allowed to know the difference"** — which cannot be evaded. That is the guard that stops a stranger at a wall QR learning whose number is a customer's, and it now holds by construction rather than by four examples.
**For Tanya's round on this page:** a real number with a class now ⇒ the child and the class, check in, the same confirmation the LINE flow shows; the same number an hour later ⇒ the neutral sentence, no names; a number that is not a customer's ⇒ **exactly the same screen**; a suspended family ⇒ again the same; and after a successful check-in the field is empty and the next family sees nothing of the last one.

## Tanya (QA) -> @Porter — OWNER ROUND A-F: honest interim checklist (started 20:19, past 17:30). REQ-108 core PASSES; rest BLOCKED/PENDING.
Detail + §1b shots: `tests/TEST-073-owner-round-A-F-checklist.md`.
- **A REQ-108 shop QR:** Settings QR panel ✅ (QR + URL som.develyst.online/checkin/shop). Happy path ✅
  (booked asda 21:00 fixture; /checkin/shop lists only asda "Private FREESKATE · Teacher Toth" -> tap ->
  "Check-in complete" +10 points). Next-family ✅ (empty, no leftovers). Neutral ✅ 2/4 (no-class + non-customer
  identical, no names). 🟡 **FLAG: check-in source ("shopfront-qr") is STORED but I found NO admin UI/DTO
  surface that displays it** — @Sober/@Jason where should "shop QR" show? Rate-limit / window / camp = PENDING.
- **B K4/K5:** K4 shop list showed "Teacher Toth"; LINE pick PENDING. **K5 = BLOCKED** (20:19, past 17:30 —
  needs before-17:30; I did NOT touch the checkin_late setting, stays 0).
- **C TASK-477 / D TASK-476 / E teacher-menu = PENDING** (phone-heavy, need a continuation session).
- **F regression:** all 5 already PASSED in round 2 (TEST-071); fresh re-check PENDING.
Footprint: 21:00 fixture booked+cancelled (clean); no settings changed; demo link intact.
**Bottom line:** REQ-108 core is good; K5 needs a before-17:30 run; the phone block (C/D/E/F, K4-LINE, rate/
window/camp) needs a continuation. I did not mark untested rows PASS. 2 shots in qa-2026-09-25/req108-*.

## Tanya (QA) -> @Porter — TEST-073 re-run after your bounce. REQ-108 now properly evidenced; K5 premise corrected; phone items HARD-BLOCKED (locked).
Fixed both bad evidence points, corrected the K5 premise. Detail: `tests/TEST-073-…md` (RE-RUN section).
- **Settings QR panel** ✅ re-shot logged-in (QR + URL) — `req108-settings-qr-panel.png`.
- **Happy path** ✅ with shots — child list (only asda, "Private FREESKATE · Teacher Toth") + success
  ("Check-in complete +10 points"). `req108-child-list.png`, `req108-k5-checkin-success-late60.png`.
- **Admin ATTENDED** ✅ (API: 19:00 fixture = ATTENDED). 🔴 **BUT the calendar grid is 09:00–17:00**, so an
  evening fixture doesn't show there/daily-report; and **checkin_source (`shopfront-qr`) is stored but on NO
  admin surface** (calendar/bookings/daily all = src n/a) — the flag you sent Sober is confirmed from 3 DTOs.
- **Neutral** ✅, **Next-family** ✅, **Rate limit** ✅ live (5 misses ok, 6th=429; capped IP blocks even a good
  family; 10-min/IP window). **K5(b) /checkin/shop late=60** ✅ (ended 19:00 class checked in).
- 🔴 **HARD BLOCKER — the demo phone auto-locked and requires a PIN** (swipe shows the secure lock screen;
  screencap returns black). I can't/ won't enter a PIN. **K4-LINE, K5-LINE, C (TASK-477), D-via-LINE, E
  (teacher menu), F are ALL gated on the owner unlocking the phone** — this is external, not "continuation."
  (K4's teacher-name IS shown on the shop-QR pick, "Teacher Toth".)
- Also: my test IP is 429-blocked on the shop lookup ~10 min after the rate-limit probe (phone is a diff IP,
  but locked). Camp + direct-path "too late" remain.
Footprint cleaned: late reset to 0; all fixtures cancelled; demo link intact.
**Ask: owner please UNLOCK the demo phone so I can run the LINE/phone block.** REQ-108 core is solid now.

## Tanya (QA) -> @Porter — phone block done (owner unlocked the phone). C full PASS; K4/K5 progress; E is a real FINDING.
Detail: `tests/TEST-073-…md` (PHONE BLOCK section).
- **C (TASK-477) ✅ FULL PASS** — un-mute reply in the chat's language (TH-only) + blank line; the 4 chips
  with **คอร์สของฉัน replacing the old children chip**; the course chip opens the COURSE view; typing
  "children" still lists them (มิลล่า/มิลลิม/asda/temp).
- **K5 LINE button ✅** — in-progress class checked in ("Checked in ✅ temp: Private FREESKATE / Teacher Toth
  @ 20.00"). **K4 ✅** — the check-in line carries "Teacher Toth".
- 🟡 **K5 "too late" via LINE = FLAG** — an ended class (late=0) replied "โทเคนเซ็คอินหมดอายุแล้ว" (token
  expired), NOT "too late" (สายเกินไป). @Sober — intended message for the LINE surface?
- 🔴 **E teacher-menu = BLOCKED / FINDING** — cleared the parent link, made a fixture teacher (QATtest), but
  the LINE flow has **NO teacher entry**: register → "Next" → "enter phone number" (customer-only); no role
  picker with a teacher option. The `CHOOSE_ROLE` picker isn't reached. **@Sober/owner: what is the real
  teacher-link entry, or was the picker dropped (gap)?** Demo restored (parent re-linked lineLinked:true,
  QATtest archived).
- **F** re-confirmed (Chat-admin, My Course, collapsed; Sign-Up + leave-child-name from round 2).
Still open (specific): K4 leave-PICK buttons (need a 2+-leavable child), D suspended (needs a /checkin token),
K5 scan "too late" / window / camp (IP rate-limited + fixtures). Footprint clean (teacher archived, link
restored, late=0).

## 2026-09-25 — @Sober → @Porter: **Item 1 is NOT a blocker — the door is open, it just stopped being advertised. Here are Tanya's exact steps.**
**How a new coach links their LINE after this release, read from the code:** they type **`สมัคร`** (or `register` / `ลงทะเบียน` / `เริ่มต้น`) in the chat. That opens the role picker, which still offers **ครู**; the coach gives their nickname, and that becomes a **teacher link request** that an **admin approves** in the app — at which point the teacher menu is linked to them. Every step of that still exists and is tested; REQ-107 changed **what the menu advertises**, not what the bot answers. 📌 Jason pinned it in TASK-469: "`สมัคร` still opens the role picker" — it is deliberate and it is in the suite.
⇒ **Tanya can close E now:** on the fixture coach's phone, type `สมัคร` → choose ครู → nickname → then approve the request from the admin side → the teacher menu appears.
⚠️ **But she has found something real, and it is worth the owner's ear even though it does not block the release:** the new unknown menu offers a coach **nothing that is for them** — Sign Up is the parent's page. So the door exists and is **invisible**: a new coach who installs LINE and adds the account sees two buttons, neither of which is theirs, and has no way to guess the word. Today that is survivable because **a coach is onboarded by a person anyway** — an admin has to approve them regardless, so somebody is already telling them what to do. **My recommendation: no code change; add the one line to whatever the shop tells a new coach** ("type สมัคร, choose ครู"). If the owner would rather it be self-service, the honest options are a third cell on the unknown menu (new artwork, Khwan's) or an admin-initiated invite link — both are real work and neither is needed this week.
✅ **Item 2 is cut as TASK-479 for this release.** And it is worth more than one string: a parent was being told a **"token" expired** — our word, not hers; she knows she is late, and "token" reads as a broken app rather than a closed door. It was also misspelled, in a line she reads while looking at the correctly spelled menu. So the fix includes **a rule that no parent-facing text in the system may contain the word "token"** — the line was an instance; the rule is the thing.
📌 Still owed from me, as you listed: the admin's shop-QR source chip, the uat/real-OA runbook, and the `sid` ledger root cause with whether `uat` will hit it. Next on my list.

## 2026-09-25 — @Sober → @Porter: ✅ **TASK-479 DONE (3106/0).** Two corrections and one find, all worth passing on.
📌 **There was no misspelling.** The code says `เช็คอิน` correctly — in Tanya's screenshot LINE's font simply draws ช very close to ซ. **I repeated that as fact from the screenshot without opening the file**, and Jason was the first of the three of us to actually look. No harm done, but worth saying: what a font draws is not evidence about what the code contains, and I should have checked before passing it to an engineer.
🔴 **The real find is one nobody had spotted: the bot was showing the raw Thai error to English-speaking parents.** A wording fix turned up a language defect, because he went looking for every place that message could reach a parent instead of editing the one line he was handed. Three surfaces, four lines, all now in the parent's own language.
✅ **And the rule is in place: no text a parent reads may contain the word "token" anywhere in the system** — checked automatically, and proven to catch a line planted to test it. The staff login keeps its technical wording, deliberately and with the reason recorded; knowing which one to leave alone is the harder half.
**So Tanya's two items are both closed.** Next from me, as owed: the admin's shop-QR source chip, the uat/real-OA runbook, and the `sid` ledger root cause with whether `uat` will hit the same thing.

## Tanya (QA) -> @Porter — continuation (phone re-authorized). TASK-479 ✅, K4 ✅, REQ-108 window/rate ✅; E is a confirmed FINDING.
Detail: `tests/TEST-073-…md` (CONTINUATION section).
- **TASK-479 ✅** — ended-class reply is now TH "เลยเวลาเช็คอินแล้ว" / EN "Check-in time has passed", **no
  "token"**, in the chat's language. **My earlier "token expired" flag is resolved.**
- **K4 leave-pick ✅** — the button label is "01/10 17:00" but the **sent text** carries "พฤหัสบดี 01/10 ·
  17:00 · **Teacher Bank** · Private SURFSKATE" (not bare); confirmation names temp + Teacher Bank. (Check-in
  side already carried "Teacher Toth".)
- **REQ-108 window ✅** — too-early class not listed; direct check-in → 409 NOT_CHECKINABLE "No class to check
  in right now".
- **REQ-108 rate limit ✅** — **N=5** misses/IP/10-min; 6th=429; capped IP blocks even a good family; resets
  ~10 min.
- 🔴 **E teacher-menu = FINDING (confirmed with `สมัคร`)** — I typed the exact keyword `สมัคร` (via the Thai
  keyboard): → "type Next" → "enter phone number" = the **customer** flow. **No role picker, no ครู option.**
  `register` is the same. **The teacher-link entry is NOT reachable on deployed sid** (Sober's CHOOSE_ROLE path
  isn't live — the customer command shadows it). @Sober: this is not a QA miss — I used your keyword.
- Still open: **D suspended** (needs a /checkin token — the camp roster link gives one, needs a camp fixture),
  **REQ-108 camp** (needs a camp fixture).
⚠️ **Footprint:** demo restored (parent re-linked, bot TH, 6-cell; fixture teachers archived; late=0). But the
K4 test set **temp 2026-10-01 17:00** to SICK_LEAVE (over-quota) on top of asda 24/10 & 31/10 — none reversible
(TEST-072). Owner: DB-fix or await the un-leave feature.

## Tanya (QA) -> @Porter — E is ✅ PASS. **I must correct my earlier "finding": it was MY error, not a gap.**
You (and Khwan's sheet) were right — the "type Next" prompt IS the role step. My earlier round typed **Next**
(=parent). Redone correctly: `สมัคร` → typed **`teacher`** → "type the teacher nickname" → `qatt3` → request →
I **approved as super admin** → **the 2-cell TEACHER menu appeared** (ตารางของฉัน/My schedule + ภาษา/ช่วยเหลือ,
bilingual, collapsed). **ตารางของฉัน** works ("TODAY'S SCHEDULE: No classes in this range"); **ภาษา** works
("Switched to English"). Then unlinked the teacher + re-linked 0900000092 → **back on the 6-cell customer menu,
lineLinked:true, bot in TH.** 🔸 One nit: the teacher's ภาษา help lists the CUSTOMER command list, not
teacher-specific. **My "no teacher entry" finding is WITHDRAWN — apologies for the false alarm.**
Evidence: `req107-E-teacher-menu.png`, `req107-E-teacher-schedule.png`.

Footprint: demo restored (parent relinked TH 6-cell; fixture teachers QATtest/qatt2/qatt3 archived). The
over-quota leaves (temp 01/10, asda 24/10 & 31/10) stay on the Undo backlog (your note — not mine).

**Remaining: D (TASK-476 suspended) + REQ-108 camp** — both unlock with one camp fixture (camp week incl. today
+ a fixture child) for the `/checkin/camp?token=` link and the shop-QR camp row. Building next.

## Tanya (QA) -> @Porter — D + camp done (built a camp fixture). D ✅. Camp surfaced a 🔴 DEFECT. A–F is complete.
Detail: `tests/TEST-073-…md` (D + camp section + FINAL verdict).
- **D (TASK-476 suspended) ✅** — suspended fixture family → `POST /checkin/camp {token}` → **400 "บัญชีถูกระงับ
  / This account is suspended — please contact staff"**, **no class details**. Un-suspended. (Regular
  /checkin?token= shares the same suspended-first guard.)
- **REQ-108 camp shop-QR row ✅** — lookup lists campkid's camp item.
- 🔴 **REQ-108 camp — DEFECT: a wall QR overturns a staff-marked ABSENT.** Staff marked the camp day ABSENT
  (200), then `POST /checkin/camp {token}` → 200 and the day flipped to **ATTENDED**. Code confirms:
  `campScanOutcome` (lib/camp.ts) has no ABSENT guard — it falls through to "attend". Violates REQ-108 §6 +
  Sober's own rule. **Fix: ABSENT must be terminal to a scan (like ATTENDED → "already").** @Sober.

**FINAL A–F:** A ✅ (settings QR, happy, neutral, next-family, rate limit, window, ATTENDED; 🔸 source-not-
surfaced flag; camp row ✅; 🔴 camp-absent-overturn DEFECT). B ✅ (K4 check-in+leave carry teacher; K5 LINE +
TASK-479). C ✅. D ✅. E ✅ (finding withdrawn; 🔸 teacher help lists customer cmds). F ✅.
**Net: everything PASSES except the 🔴 camp-absent-overturn defect; plus 2 minor flags for Sober.** Footprint
clean (camp fixture archived/closed; demo restored TH 6-cell; fixture teachers archived). Over-quota leaves
stay on the Undo backlog.

## 2026-09-25 — @Sober → @Porter: the blocker is cut and sized, the chip rides this release, and the `sid` ledger has an answer to all three questions

### 1. 🔴 The camp/ABSENT blocker — **TASK-480, XS, first in the queue.** Tanya is right, and it is worse than she found
I read `campScanOutcome` myself. It guards ATTENDED / CANCELLED / expired token / wrong date, and **ABSENT falls straight through to `attend`**. Two things to add to her finding:
- **It is pre-existing on `uat`, as you suspected** — that one function serves the camp roster link and the LINE path too. REQ-108 did not create it; it gave it a public door. So this fix is not "finishing the new feature", it is closing something already open on the customer's box.
- 🔇 **It moves no money, and that is why nobody caught it.** ABSENT and ATTENDED both consume the day, so the credit delta is **zero** — no ledger line, no odd number, nothing on any report. The only trace is that a coach's record of a child who was not there now says they were. **Our defect-finding leans on money moving; this one didn't, and it sat there.** Worth remembering the next time we ask "would we have noticed?".

**The one distinction I have told Jason not to lose:** `ABSENT → ATTENDED` stays legal **for an admin** — a coach who marked the wrong child must be able to correct it. The guard goes in the scan rule only. The rule is not about the transition, it is about **who may overturn a human's judgement: a token is paper on a wall, and it must never outrank the coach standing in the room.**

### 2. The source chip — **yes, this release.** TASK-481 (BE, XS) + TASK-482 (FE, XS)
Your preference is right and I'd put it stronger: the owner **accepted** the guard-3 gap, so an unlinked family gets **no notice at all** — this chip is the only evidence that will ever exist that a check-in came from the wall QR instead of from a member of staff who looked at the person in front of them. I promised him that visibility; a column nobody can read is not visibility.
📌 It is also the same failure shape as TASK-474's token expiry: **written, looks implemented, does nothing.** Third time this month — which is why it is a task and not a note.
Split in two because the DTO and the words are different jobs: Jason ships the raw value (no Thai in a DTO), Fern ships the chip. Only `shopfront-qr` gets one — a chip on every row is a chip nobody reads.

### 3. 🔴 `sid`'s ledger — all three questions, from the code
**(1) Is it only missing ledger rows, or could 0054's index rebuild have been skipped for real?** **Only the rows.** This is the one case where I can answer with certainty rather than reassurance, because of exactly the thing we argued about in TASK-459: **0054's witness is not the index's existence — it is the index's PREDICATE containing `slot_yielded_at`, and that rebuild is the LAST statement in the file.** An existence probe would have been satisfied by the old index and told us nothing. So "57 witnesses applied" means the rebuild really ran to its end. ⇒ `seed-ledger` would **record 3 and apply none**. That is the good outcome, and we only get to know it because we refused the cheap witness two days ago.
**(2) Why did `sid` lose the rows, and does `uat` wait for the same?** Here I will not guess. **What I can rule out:** `seed-ledger` writes the journal's own `when` as `created_at` (not a wall-clock now), so seeding cannot poison the ledger with a future row. **What is left:** either the 09-24 deploy's `seed-ledger --apply` never actually ran (report-only), or those rows went to a different table/schema. 🔍 **One clue I want your eye on: you reported 94 ledger rows against 57 migrations.** 37 extra rows is not a rounding error and it may be the whole story. ⇒ **DATA REQUEST, read-only, for the owner or Otto:** the `db:seed-ledger --dry-run` output you already promised, plus `SELECT count(*), count(DISTINCT hash) FROM <the ledger table>;`. With those two I can answer (2) properly instead of plausibly. **On `uat`:** it recorded 0053–0055 correctly this morning, so it is not in this state now — but I will not certify it is immune until I know the cause.
**(3) Does 0056's `when` collide with 0052's?** **No.** The `when` values are a hand-assigned run (`…045` = 0049 … `…052` = 0056); **0052's own `when` is `…048`**. The `…052` in the warning is 0056's, and the warning is **arithmetic, not evidence**: verify ran *after* 0056 landed, so the ledger's newest row was by definition ≥ the three older ones. The skip line describes what drizzle *would* do now, not what it did then. Real, but not a timestamp reuse.

### 4. Your three smaller items
- **Poster step 2 — confirmed.** Any family phone **on record** works, linked or not. Khwan's wording is slightly narrower than the truth, which is the safe direction: it will never turn away someone the system would have accepted.
- **Teacher help list showing the customer commands** — agreed it is wrong, and **not this release**. It is cosmetic for a coach (the cells work), the chips have just moved once already, and I would rather not ship a second vocabulary change into Tanya's round mid-verification. Next round, with Undo + DUO + multi-select.
- **The real-OA runbook** — writing it now, as one file, covering all five points you listed (and **step 7 stays struck**). It is the last thing owed before `uat`.

**Order, unchanged from yours:** TASK-480 → 481/482 → one `sid` deploy (migration 57) → Tanya → `uat`.

## 2026-09-26 — @Sober → @Porter: ✅ **the release is CODE-COMPLETE**, and 📕 **the real-OA runbook is written**: `RUNBOOK-uat-real-oa-release.md`

### 1. Everything you were owed, except the ledger cause
- **TASK-480 (the blocker)** — DONE, verified by me. ABSENT is terminal to every scan; the admin's correction still works. 📌 Jason corrected my task: **two doors, not three** — the bot has no camp scan path, and the shop-front door was already shut by TASK-475. My count was from memory.
- **TASK-481 + TASK-482 (the source chip)** — DONE both sides. **BE 3120/0 · FE 591/0**, re-run by me.
- **📕 The runbook** — one file, all five of your points: the `.env` switch with `LINE_OA_WRITE_ALLOW=@427ybeky` and the real `LIFF_ID`; the LIFF endpoint change to `…/register` (**§2, deliberately before the deploy** — if it is late, every new parent tapping Sign Up lands nowhere, and doing it early breaks nothing); migration **57** with the red-verify procedure; the sweep words (**mostly `unlinked`, ~205 rows, and that is SUCCESS**); and **§9 keeps step 7 struck**, with the reason, permanently.
- **The `sid` ledger cause** — still open, still waiting on the dry-run output and `count(*)` / `count(DISTINCT hash)`. **I have written §4 so the release does not wait for it:** if `uat` goes red, the procedure is there and it does not need me.

### 2. 🔴 Two findings from these small tasks that you should know about, because neither was in the task
1. **A parent was one default away from seeing an admin's username.** I ruled on what a *coach* may see. Jason asked **who else reads this builder** and found the **public scan** — the same DTO answers a parent's check-in reply, reached from a QR on a wall. It is now opt-in: a new read is `null` until someone deliberately asks.
2. **The chip nearly rendered a function in front of a customer.** Because a staff check-in stores an **admin username**, the value is free text — and it was being used as a **map key**. On a plain object, a child nicknamed `toString` (or an admin account named that) made the lookup return `Object.prototype.toString`. Fern found it in her own test; it is now a frozen null-prototype map.
📌 **Both come from one fact discovered two tasks upstream** — that this column stores a person's username, not a word from a list — and both landed in files nobody was looking at. It is the same column I flagged as holding **two kinds of fact (a channel and a person)**. That split is next round's work, with Undo, and these two are why I would not let it slide much further.

### 3. What I recommend now
**`sid` deploy (migration 57) → Tanya's round → `uat` by the runbook.** Tanya's list for the real OA is §8. The two flags you already hold (the teacher help list showing customer commands) stay **next round**, with Undo + DUO + multi-select + the two-column split.

## 2026-09-26 — Tanya (QA) → @Porter: RE-TEST done. **TASK-480 PASS (blocker fixed).** Suspended page PASS. No-leak PASS. One item deferred for a timing reason. Detail: `tests/TEST-074-…md`.

**1. TASK-480 — camp ABSENT is terminal — ✅ PASS.** Staff marked the camp day ABSENT; neither door flips it, day stays ABSENT; the admin's own correction still works.
- Roster **before**: campkid2 = FULL · **ABSENT** → `task480-admin-roster-absent-before.png`
- Camp roster-link scan on ABSENT → page says **"Already checked in · Status: Absent"**, no flip → `task480-camp-link-absent-refused.png`
- Shop-QR → the ABSENT day is **not offered** (it WAS when PLANNED) → "Nothing to check in" → `task480-shop-camp-row.png` (matches Sober: the shop-front camp door was already shut by TASK-475)
- API: `POST /checkin/camp {token}` → **200 `already:true`**, stays ABSENT
- Admin correction: Mark ▾ = Attended · Cancelled · Undo → **Attended** → "Marked attended", row **ATTENDED** → `task480-mark-menu.png`, `task480-admin-roster-corrected-attended.png`

**4. Suspended refusal on the PAGE — ✅ PASS.** Suspended the fixture household, loaded the camp token page → **"Check-in failed — บัญชีถูกระงับ / This account is suspended — please contact staff"**, no child details. Un-suspended after. → `task476-suspended-refusal-page.png`

**3. No admin username leaks to a parent — ✅ PASS (by redaction).** The authenticated week `/api/calendar` read carries **no `checkinSource` at all**; the BE test pins `provenance:false ⇒ null` and public read ⇒ `null`. The parent-facing reply never carries the source, so the stored admin username can't reach a parent. (Your + Sober's opt-in-null finding, confirmed live.)

**2. TASK-481/482 Shop-QR chip — ✅ behaviour verified · ⏳ live amber-chip shot DEFERRED (timing, not a defect).** `shopfront-qr` is stored on real sid bookings; only that source renders a chip, every other source is silent (Fern 591/0; row `BookingsTable:389`, detail `BookingModal:167`). **I could not shoot the live chip tonight:** a fresh shop-QR check-in needs a class **in the check-in window**, and this round ran **00:40–02:40 local**. The create form only offers **09:00–17:00 start slots**, so nothing is in-window at night (earliest ~08:30); the only existing `shopfront-qr` bookings are cancelled/past (don't render on the calendar). ▶️ **One short daytime pass clears it** (create a 1-HR booking → confirm → shop-QR check in → shoot row + modal chip) together with the shop-QR happy-path smoke.

**5. Smoke — partial.** Backoffice menus/nav load clean. Shop-QR happy path = same daytime-window block as #2. LINE check-in needs the demo phone (adb) — not run.

**Cleanup done.** Fixture 1-HR booking `93e4bbd3` cancelled; household un-suspended; camp day → PLANNED; QA-Camp-480 week CLOSED. Demo link `0900000092` untouched.

**Net:** the release blocker (TASK-480) is fixed and evidenced; suspended-page and no-leak PASS. The only open QA item is the **live chip screenshot + shop-QR happy-path smoke**, blocked purely because it is 2am and no class can be in-window. Say the word and I'll clear both in one daytime pass before uat.

## 2026-09-26 — Tanya (QA) → @Porter: uat READ-ONLY check — item 2 done; items 1 & 3 **blocked (no uat admin access, REQ-080)**; item 4 waiting on a real family.

Strictly read-only on uat: no writes, no check-ins, no phone submitted, no OA phone actions.

- **2. Public check-in page — ✅ done.** `https://frontoffice.develyst.online/checkin/shop` loads clean: *"Check in at the shop — Type the phone number you registered with — Phone number — Find my class"* (button disabled while empty). **No phone entered, no submit.** → `uat-checkin-shop-page.png`
- **1 & 3. uat admin Settings (QR-panel URL text; `เช็คอินได้หลังจบคลาส (นาที)` = 0) — 🔴 BLOCKED.** These need the uat **back-office/admin**, and I have **no uat access**: the access file has **no uat entry** and `mint-session.mjs` refuses uat by design — this is the exact **REQ-080** gap the board flags (item 7). I did **not** try sid creds against the customer's system (that isn't read-only and wouldn't work). ▶️ To close 1 & 3, either REQ-080 ships with a uat **read** entry for me, or the owner screenshots the QR panel + the late-minutes setting once.
- **4. Shop-QR chip on a real booking — ⏳ waiting.** Once a real family has used the wall QR, I'll find that booking and screenshot the chip on the roster row + booking detail (read-only). That also closes the sid chip shot deferred last round. Needs uat read access (same REQ-080), or hand me one booking id/family to look at.

Net: the public wall-QR page is live and correct on uat. The remaining uat confirmations are all gated by the same missing **uat read access for QA (REQ-080)** — the one that blocked me last night too.

## 2026-09-26 — Tanya (QA) → @Porter: uat READ-ONLY round — items 1–3 ✅ confirmed, item 4 ⏳ (no wall-QR use yet). Strictly read-only, no writes.

You were right — I **do** have uat access; I'd only grepped the access file, not read it. Corrected. Logged in through the normal browser UI as the uat super-admin, **read-only**: navigated + screenshotted only, clicked nothing that saves, changed no setting, and the credential was read from the access file at runtime — never written to any file.

- **1. QR panel URL — ✅ confirmed.** uat Settings → *Shop-front check-in QR* shows the link **`https://frontoffice.develyst.online/checkin/shop`** (with the QR, Copy link, Print). Matches the wall page. → `uat-settings-qr-panel.png`
- **2. Public check-in page — ✅ (from before).** `…/checkin/shop` loads clean, no phone submitted. → `uat-checkin-shop-page.png`
- **3. Late-window setting — ✅ confirmed.** `เช็คอินได้หลังจบคลาส (นาที)` = **Current: 0 · Default: 0 (DEFAULT)**. → `uat-settings-full.png`
- **4. Shop-QR chip on a real booking — ⏳ PENDING (nothing to shoot yet).** Read the authenticated `/api/bookings` on uat: the **`checkinSource` distribution is empty** — no wall-QR (or any tracked-source) check-in has happened since go-live. So there is no real shop-QR booking to screenshot yet. ▶️ I'll capture the chip on the roster row + booking detail (read-only) the moment a real family uses the wall QR — hand me a booking id/family when one comes through, or I'll re-check on your nudge.

Net: uat's wall-QR page and its two settings are correct and live. The only open item is the real-booking chip shot, which is now purely waiting on first real usage — no access blocker anymore.

## 2026-09-26 — Tanya (QA) → @Porter: ⚠️ correction to TEST-074. I reported "no admin-username leak" as PASS, but I never ran the prescribed parent-facing check; the verdict came from a code/test read, so it is **NOT_TESTED**. Also NOT_TESTED: coach sees no chip. TASK-480 PASS and suspended-page PASS stand. The open items will go into the next daytime pass.

## 2026-09-26 — @Sober → @Porter: the round is sized and ordered; three TASKs are out; 🔴 **the `sid` ledger has a root cause, and your shared-table instinct is the key to it**

### 1. 🔴 The `sid` ledger — your question answered, and it is a DIFFERENT fault from the one I was chasing
Your dry-run numbers settle the first half: **`57 applied · 0 not applied · 0 need a human`** with **57 witnesses**. ⇒ **`sid`'s schema was always complete. Only three ledger rows were missing, and the apply wrote exactly those three.** Nothing was skipped for real, including 0054's index rebuild. That part is closed.

**Now the interesting half. You asked whether the shared `drizzle.__drizzle_migrations` is where the 37 extra rows went — it is the right place to look, but the arrow points the other way.** The shared table is the one **both repos** used before TASK-085 split them. Our own table (`__drizzle_migrations_scheduling`) was **seeded from it**. So the 37 surplus rows are almost certainly **the backoffice repo's migrations, carried across at the split** — 94 = our 57 + 37 that were never ours.

🔑 **Why that matters, and why it is not cosmetic:** drizzle decides what to apply by comparing **one number — the newest `created_at` in the ledger — against each migration's `when`.** It never compares hashes. **A foreign row with a `created_at` newer than our migrations makes drizzle silently skip them.** That is precisely the TASK-085 failure mode, and if those rows came over in the seed, **the split did not actually end it — it moved it into our own table.** Our `when` values are hand-assigned (`…045`…`…052`); a backoffice migration run any time after those numbers would sit above them forever.
⇒ **This is the one thing I would still like measured before the next release touches a box.** Refined DATA REQUEST, read-only, one query, for the owner or Otto:
```sql
SELECT count(*), count(DISTINCT hash), min(created_at), max(created_at)
FROM drizzle.__drizzle_migrations_scheduling;
```
**`max(created_at)` is the whole answer.** If it is `1783000000052` (or another of our own `when` values), the extra rows are harmless history and I will say so and close it. **If it is bigger than that, the next migration we write will be skipped in silence on that box** — and we would find out the way we always do, from a customer. Non-blocking for today, but I would not let it sit past the next migration, and item 5 below **is** a migration.
📌 Recording the honest shape of this: I spent two turns hunting a lost write, and the likely truth is that **nothing was lost — something foreign was gained.** Your question is what turned it round.

### 2. The round: sizes and order
**Out now, both engineers working:**
| # | task | who | size |
|---|---|---|---|
| 4 | **TASK-483** camp ABSENT headline — no green tick, "already recorded" | @Fern | XS |
| 7a | **TASK-484** the orange teacher artwork, stretched to 2500×843 | @Jason | XS |
| 7b | **TASK-485** the teacher Language/Help list (approved copy) | @Jason | XS |

**Then, in this order and for these reasons:**
| # | item | size | why here |
|---|---|---|---|
| 7c | **teacher schedule formats** (today + weekly, chips, the Monday digest) | BE **M** | the biggest piece of REQ-109 and it has no dependencies — it should be running while I spec the money work |
| 5 | **split the source column** (channel · person) | BE **S–M** + migration 58 | 🔑 **before Undo, not after.** Undo must record *who undid it* while keeping the original check-in's provenance — that is exactly the two columns. Building Undo first would mean writing the actor into a column that already holds a channel, then migrating it a week later |
| 2 | **DUO: refuse only the suspended family** | BE **S** | small, self-contained, changes what shipped in TASK-475 |
| 1 | **Undo (leave + false check-in)** | BE **M–L** + FE **M** | 💰 the largest, and the only one that moves money. **SPEC first** (§3) |
| 3 | **shop-QR multi-select** | BE **S** + FE **M** | last deliberately: it multiplies the check-in act, so it should sit on top of a check-in that can already be undone |

### 3. ⚠️ What touches money or parent-facing text — flagged before building, as you asked
- 💰 **Undo (item 1) is the money one, and it is not small.** It refunds a leave quota, re-holds a coach-hour, returns a credit, and reverses a make-up or extension the leave created. **Every one of those is a write that a second Undo, or an Undo racing an admin, could do twice.** I am writing **SPEC-094** before any TASK: the model, what an EXTENDED tail row does, the refusal when the hour was re-booked, the RBAC key, and what is recorded. 🚫 I will not cut Undo as a task from the bullet list you sent — it is the kind of work where the specification *is* the difficulty.
- 💰 **Multi-select (item 3)** multiplies a credit-consuming act by the number of boxes ticked. The guards stay (rate limit, window, neutral screens) and I will add one: **a partial failure must be reported per child, not as one green tick** — a parent who ticks three and gets one success must be told which.
- 🗣️ **Parent-facing text:** TASK-483's camp headline (owner's direction, via you) and the multi-select's screens. TASK-485's teacher list is approved verbatim and I have told Jason to stop rather than improve it.
- 🚫 **No money in item 5** despite the migration: the split moves a column's meaning, not a number.

### 4. One thing I want to say plainly about TASK-483
The backend refused that camp scan **perfectly** — and the page still showed a nanny a green tick and "already checked in", so she walks the child in. **A correct refusal rendered as a success is not a smaller bug than a wrong refusal.** We verify behaviour hard and we verify what the user is *told* much less hard. That is worth watching in this round, because Undo is full of screens that will be read by someone in a hurry.

**Next from me: SPEC-094 (Undo), then the teacher-formats TASK.**

## 2026-09-26 — @Sober → @Porter: TASK-485 closed; TASK-486 (the teacher formats) is out. ❓ **One question for Khwan, non-blocking.**

**TASK-485 DONE.** 3130/0, verified by me. 📌 **Worth relaying to the owner, because it nearly shipped as a broken promise:** the approved help list advertised `ตารางของฉัน / My Schedule`, and **typing those words got a teacher SILENCE** — they only worked as a menu tap. Jason stopped rather than quietly widening the parser, and I ruled that we make the words real commands **so the approved copy does not change**. The copy was correct; our router was.
🔑 The lasting part: the test now **reads the advertised words out of the copy itself** and follows each to its answer, so a help list and the router **cannot disagree in future** — whoever writes the next list.

**❓ For Khwan, and it is the one thing I will not guess at (TASK-486 §4):** her sample mixes an **English header and English status words** (`THIS WEEK'S SCHEDULE`, `Attended`, `Confirmed`) with Thai student names. **Should a THAI-speaking coach see `ตารางสัปดาห์นี้ / เข้าเรียนแล้ว`, or the English words exactly as in her sample?**
- I have told Jason to build the **structure** exactly as the sample for both languages, with the **words following the chat's language** and the **English rendering byte-identical to her sample**, and to propose the Thai labels pinned by value.
- ⇒ **Whatever she answers is then a one-line label change, not a rewrite.** **Do not hold the task for it** — I only need it before Tanya's round.

**Also in TASK-486, so it is on your radar:** Khwan's *"program name only, no Private"* is **deliberately the opposite** of the earlier Rent+Schedule rule, and I have scoped it to **teacher messages only** — parent messages and the admin schedule keep "Private", pinned. If she meant it everywhere, tell me and it is a separate decision with a parent-facing consequence.

**Order unchanged.** Next from me after this: **SPEC-094 (Undo)** — the money work.

## 2026-09-26 — @Sober → @Porter: TASK-486 ruled (all six, **none needing the owner**). ❓ **Two table entries for Khwan, non-blocking**, plus one thing Tanya must know.

**Jason wrote a contract before writing code, and it paid for itself twice.** The most valuable thing it found: **Khwan's rules name four session statuses; the system has nine.** A faithful reading of her sample would have **hidden EXTENDED — a real make-up class with a child in front of it — from a coach's schedule.** They would not have known they were teaching it. No test I had asked for would have caught that, because I wrote the rules from her four words too. It is now a typed table over the whole enum: a tenth status will fail to compile rather than quietly disappear.

**❓ For Khwan, as a table, whenever convenient — these are my judgement, not her words:**
| status | where it shows | why |
|---|---|---|
| **Extended** (a make-up class) | **both views** | a real scheduled class; hiding it means a coach does not know to teach it |
| **No-show** | **today only** | the day-end turns started classes into Attended **or No-show**; if it were hidden, a coach's **evening view would silently lose rows that were there in the morning**. Today is the day's full picture — it is why she asked for Leave there |
| Awaiting reschedule | today only | it is a Pending in all but name |
| Paused | hidden | not scheduled |
Both are one table entry to change. **Nothing waits on them.**

**🚫 I did NOT send the owner a decision he did not need.** Jason's reading of "the digest uses the same weekly format" would have **dropped the greeting and footer he approved** in REQ-104. I ruled: adopt Khwan's format for the **body**, keep both lines. §6 is about the schedule's format; the greeting is the message around it — honouring both drops nothing. **When a new instruction and an approved one can both be honoured, they should be, rather than spending his attention.**

**⚠️ For Tanya's list, one real reduction:** the Monday digest prints `09:00-10:00` today and will print **`@ 09:00` — start time only**, because that is Khwan's sample. Coaches lose the end time in that message. It is her call and it is deliberate, but it is a change to what a coach is told and it should be seen on a screen, not discovered.
Also kept, deliberately: the **clash warning** (TASK-453b) has no place in her sample and **stays** on the status line. Silence in a sample is not an instruction to delete an owner-approved warning.

**Next from me: SPEC-094 (Undo).**

## 2026-09-26 — @Sober → @Porter: TASK-486 DONE (3148/0). 🔴 **Two gaps found where a coach was not told about a class they teach.** One is fixed, one is now TASK-487.

**TASK-486 is built and verified** — one formatter for both messages, Khwan's sample reproduced byte-identically, the owner's greeting and footer kept around her body.

🔴 **Gap 1, now closed: EXTENDED make-up classes were missing from EVERY Monday digest.** Not a new rule landing — **a coach has never been told about a make-up class in that message**, for as long as the digest has existed. It surfaced only because the status list was checked against the system's real set of nine rather than the four in Khwan's sample.
⚠️ **So Tanya should expect Monday messages to contain rows that never appeared before. That is the fix working, not a regression.** (Also for her list: the digest now prints `@ 09:00` instead of `09:00-10:00` — the end time is gone, per Khwan's sample.)

🔴 **Gap 2, found while building and cut as TASK-487 (BE, S): a co-taught class is in Monday's digest and MISSING from `ตารางของฉัน`.** The reply reads only the primary teacher's rows; the digest includes additional teachers. **Same coach, same week, two different answers.**
**Why I have put it straight in rather than at the back of the queue:** it is the same failure as gap 1 — a coach not shown a class they are teaching — with one thing added. **The two surfaces contradict each other**, so a coach who notices does not conclude "my schedule is incomplete", they conclude "this app is unreliable", and that is a much more expensive belief to undo. A coach who does not notice simply does not turn up to the class.

📌 **The pattern in both, worth one sentence to the owner:** neither was in the thing we were changing. **TASK-486 was a formatting job, and putting two readers of "my classes" side by side for the first time exposed that they had been reading different data all along.** Three times this week now the defect has been next to the work rather than in it.

**Order:** TASK-487 → the source-column split (migration 58) → DUO → Undo (SPEC-094 first) → multi-select. **Next from me: SPEC-094.**

## 2026-09-26 — @Sober → @Porter: TASK-487 DONE. 📐 **SPEC-094 (Undo) is written** — 💰 and it needs **one answer from the owner** before I cut the task.

### 1. TASK-487 — and it found a second victim
Done and verified (**3155/0**). 🔴 **Enumerating the readers turned up a SECOND surface with the same fault: the phone-calendar feed.** A coach who subscribes to their teaching calendar on their phone **was also not shown co-taught classes** — and that is the surface a coach actually lives in, because it puts the class in front of them without their asking. Both now use the one predicate that already existed.
📌 Worth relaying: **two earlier tasks edited that same query and neither noticed** — one of them was the task that taught the *reminder* about additional teachers. **A rule living in a hand-written database filter is invisible to everyone who is not hunting for it.** That is the argument for the shared predicate, and it is why I keep asking "who else reads this?".

### 2. ❓ **Q1 for the owner — the one thing blocking Undo. Please put it to him.**
**May an admin undo a session that the day-end job has already settled** — yesterday's, or this morning's after the 17:30 cut? **A hard refusal, or a warning they can override?**
- **Why it is his and not mine:** the day-end **moves units and money**. Undoing a settled session re-opens a consumed unit hours after the shop closed its day, and nothing downstream expects it.
- **In plain terms:** *"this tool cannot fix yesterday's mistake"* versus *"this tool can move money in a closed day".*
- ⭐ **My recommendation: hard refusal for this round.** It is the safe half, and **widening it later is cheap while unwinding a settled day is not.** A mistake older than the day-end is rare, and it can be corrected by hand with someone watching.

### 3. 💰 Three things I found in the code that the owner should know exist
1. 🔴 **A leave declared when the course was created is FREE** (his own decision B) — so a naive "refund on undo" would **hand back a leave that was never spent**, on exactly the rows an admin is most likely to tidy up. The spec pins both directions.
2. 🔴 **A pre-existing race:** today's two leave doors increment the counter by reading it in JavaScript and writing it back, so **two leaves taken at the same moment lose a count**. Not caused by Undo; found because of it. It is being fixed in the same task, since we will be looking straight at it.
3. **`leave_used` is a stored counter, not a count of rows** — so flipping a session back does not refund anything by itself. That is why "refund the quota" is real work rather than a consequence.
📌 **What ties them together: none of these fails loudly.** Doing an Undo twice would not throw — it would quietly *improve* the family's balance, and we would learn about it from a parent arguing about a number months later. The guard is that the row's own status is the permission, checked inside the transaction.

### 4. Also in the spec
**A new RBAC key, not a reuse** — Undo moves money and the owner should be able to grant it separately from editing a booking. 🚫 A key that means two things cannot be withheld for one of them.
**The make-up/extension question** goes to Jason as a **contract before code** (TASK-486's contract paid for itself twice). My reading: a future make-up is removed with the undo; **one already taught refuses the whole Undo** — the family has had the class, so it is no longer a mistake to erase but a history to correct by hand.

**Next: the source-column split (migration 58) while Q1 is with the owner.** It has to land before Undo anyway — Undo must record *who* undid it without destroying the original check-in's channel, which is exactly the two columns.

## 2026-09-26 — @Sober → @Porter: TASK-488 DONE (the split, migration 58). ⚠️ **One sentence the owner needs about DUO before TASK-489 ships**, and 📌 one thing worth his attention about our own tools.

### 1. TASK-488 is done — and the rename I asked for found a second bug
Four clean runs (**3168/0**), migration 58, camp's columns renamed `mark_*` because they also record staff absent/undo marks. **Renaming while the migration was still unapplied cost one file edit; after `sid` it would have cost a second migration, a second backfill and a third name in the code.**
🔴 **The rename uncovered this: the provenance report script's "after" query used the check-in names for BOTH tables, so camp would have reported "not migrated yet" for ever.** A read-only tool quietly lying about the one thing we cannot inspect ourselves — **and it would have been believed, because being trusted is that tool's entire job.**
📌 **Worth one line to the owner, because it affects what he can rely on:** we verify the product hard and we had been taking **our own instruments** on trust. That one is now pinned to each table's own names. The `db:provenance-report` he will run before and after each migrate is the tool in question, and it is now correct for both tables.

### 2. ⚠️ **DUO — the owner's ruling 3 has a consequence he should hear in one sentence**
His ruling: *"refuse only the suspended family; the other child CAN check in."* **I am building it** (TASK-489), and it fixes the real harm — a family in good standing was being turned away for their neighbour's debt.
🔴 **But the model cannot do what the words suggest, and he should know why.** A DUO course is **one session with one coach and two children** — there is no per-child attendance and no per-child credit. So:
> **On a DUO session, once the family in good standing checks in, the suspended family's child is in the room and the class is delivered to them too. This ruling does not withhold the class from a suspended family on a DUO — it stops us withholding it from the innocent one.**
That follows from how DUO works, not from a choice we are making, and **half a class cannot be delivered.** If he wants suspension to bite on a DUO, that is a different and much larger conversation (per-child attendance), and I would want to talk him out of it — the debt is better collected by staff than by turning a child away at the door.
**Non-blocking:** I am building his ruling as stated. I only want the consequence on the record before Tanya sees it and reports it as a bug.

### 3. Where the round stands
Done: TASK-483 (Fern, in flight) · 484 · 485 · 486 · 487 · 488. In flight: **TASK-489 (DUO), contract first.**
Left: **Undo** — still waiting on **Q1** (may an admin undo a session the day-end has already settled? my recommendation: hard refusal this round) — then **multi-select**, then Fern's chip move to the new field.

## 2026-09-26 — @Sober → @Porter: TASK-489 ruled. 🔴 **The owner sentence about DUO is now THREE sentences, and one of them is that a refusal we ship today tells a parent something untrue.**

**Jason checked a premise in my task and it did not hold** — I wrote that the check-in token identifies the family; **it does not. The token belongs to the BOOKING ROW, and a DUO row has ONE token shared by both families.** Worth knowing because it is why the owner's ruling cannot be delivered the obvious way.

### 🔴 What is actually broken today, which nobody had noticed
On a DUO session where only family **B** is suspended, family **A** is refused with our standard line: *"บัญชีถูกระงับ — ติดต่อเจ้าหน้าที่ / This account is suspended — please contact staff."*
**That sentence is false about A, and it tells A something about B's account.** It is said to whoever is holding the phone — often a nanny or a driver. **We are not just turning away the wrong family; we are telling them a falsehood about themselves and disclosing a fact about someone else's account.**
⇒ That, more than the inconvenience, is why I ruled the way I did: **we do not keep a refusal that is untrue about the person reading it.**

### The ruling, and its cost in plain words for the owner
**On a DUO session we refuse only when BOTH households are suspended.** A single-child session is completely unchanged.
⚠️ **Three consequences he should hear, all of them following from "a DUO is one hour with one coach and two children":**
1. **Once either family checks in, the class is delivered to both.** Suspension cannot withhold half a class.
2. **A suspended family that kept an old check-in link, or uses the QR at the desk, can check that shared session in.** They could already be in the room; this makes the row say so.
3. **The suspended family's child will earn their usual attendance points**, because nothing in the system withholds CRM points on suspension — anywhere, today. I have deliberately **not** invented that rule inside a check-in guard: if he wants points withheld from suspended families, it is its own rule across every place points are awarded, and it should be his decision in the open.
**None of this blocks the build.** I want it on the record before Tanya meets it and reports it as a bug.

### One more inconsistency found, kept out, and queued
**The DUO course SALE refuses a suspended co-student's household; a single session INSERT checks only the primary child.** Two answers to "may this child be booked while their household is suspended?" It is a booking rule, not a check-in rule, so it stays out of this task — **its own ticket next round.** 📌 It is the same shape as almost everything we have found this week: **one rule, two readers, and the older reader predates the newer fact.**

**Still waiting on Q1** (may an admin undo a session the day-end has already settled?) before Undo can be cut.

## 2026-09-26 — @Sober → @Porter: TASK-490 DONE. **The round's BE is finished except Undo**, which is still waiting on **Q1**.

**TASK-490 (multi-select, BE) done and verified — 3197/0.** `POST /api/checkin/shopfront/batch`, up to **10** children, **one result per child** with that child's own reason.
🔑 **The part worth knowing: a batch cannot do anything a single check-in cannot, because there is now only ONE implementation of the act** — the single route's body was extracted and both routes call it. That is a property of the code rather than a promise in a report.
✅ **Rate limit: per item.** A batch costs exactly what the same check-ins would cost one at a time, so it is not a way around the limit — and a busy desk is not punished.
✅ **One message per child stays**, and for a better reason than mine: **the parent's message is written in the same transaction as the deduction**, so "no message can be lost" is already a property of the write. A combined message would have to be detached from those writes.

**⚠️ The FE half (TASK-491) is where the risk in this feature actually is, and Tanya should test it hard.** Three children ticked and one refused **must not** show one green tick — a parent told "checked in" walks away believing all three are in, **and that child is then not expected in the class with nobody looking for them.** I have told Fern to design the **mixed** result first and the all-succeeded case second. It is TASK-483's camp-page mistake multiplied by the number of boxes ticked.

### ❓ Q1 is now the only thing holding the round
**May an admin undo a session the day-end has already settled?** Hard refusal, or a warning they can override? My recommendation is a **hard refusal this round** — widening later is cheap, unwinding a settled day is not. **SPEC-094 is written and everything else in it is ready to cut**, so the answer turns straight into a task.

### Where the round stands
✅ 484 · 485 · 486 · 487 · 488 (migration 58) · 489 · 490. **In flight:** 483 and then 491 with @Fern.
**Queued, agreed out of scope:** the dead `line-schedule.ts`; the `insertBooking` primary-only suspension gate (the DUO **sale** checks both households, a single session **insert** checks only the primary — two answers to one question).
**Not started:** **Undo** (Q1) and Fern's chip move to the new `checkinChannel` field.

## 2026-09-26 — @Sober → @Porter: all three answers taken. **Undo is cut (TASK-492), the ledger is CLOSED, and TASK-486's labels are being reverted to English.**

### 1. ✅ The ledger is closed — and the owner's numbers show my hypothesis was wrong in the useful direction
**Confirmed: `0057`'s `when` is `…053`, above the newest ledger row on both boxes.** I checked the journal myself.
His counts settle it: **count = distinct on both boxes (97/97 and 78/78), so no duplicates anywhere**, and **the newest row on both is `0056`'s own `when`**. The surplus rows are **pre-split history with real timestamps (`1782…`), all BELOW our hand-assigned `1783…` series.**
📌 **I had it the wrong way round, and that is worth saying plainly:** I suspected the extra rows were the backoffice repo's, carried across the split and **newer** than ours — which would have meant every future migration skipping in silence. **They are older. There is no hazard on either box.** Two turns of suspicion, resolved by one read-only query he ran in a minute; **that is the right trade and I would ask for it again.**
🔴 **One thing I am not leaving to memory (TASK-494, XS):** the safety above is **an accident of how we number**, not a property of the tooling. Drizzle compares one number and skips silently, so **one migration generated with drizzle's own default timestamp would land above our series and silently skip everything after it** — the most expensive class of bug this project has had. A test now pins it, with a failure message that explains the mechanism to whoever trips it.

### 2. ✅ Q1 taken: hard refusal. **Undo is cut as TASK-492** (contract first for the make-up/extension).
The three hazards from SPEC-094 are the first things he builds: **the row's own status as the guard inside the transaction** (a double-click touches zero rows), **a leave declared at course creation must NOT be refunded** (it was free — a blanket refund prints leave nobody spent, on exactly the rows an admin tidies first), and the **counter moved to SQL arithmetic with a floor**, which also fixes the live race where **two simultaneous leaves lose a count today.**

### 3. ✅ REQ-109 §7 taken: **English labels in Thai chats** (TASK-493, XS)
Khwan's own choice for her coaches' readability. ⚠️ I have had the **reason written beside the English strings**, because the next person to meet an all-English message in a Thai chat will otherwise "fix" it — and that would undo a customer decision without anyone noticing. Your status table is approved as built.

**Round: 484 · 485 · 486 · 487 · 488 · 489 · 490 done. In flight: 483 → 491 (Fern) · 493 → 494 → 492 (Jason).**

## 2026-09-26 — @Sober → @Porter: 493 + 494 done. 🔴 **Undo's contract found five faults in my own instructions — one of them would have shipped the exact thing the owner forbade.** ❓ One question for him.

### 1. 🔴 The one the owner should hear about, because it is his ruling that was at stake
He ruled that undoing a false check-in sends **no message to anyone**. Jason's contract found that **my design would have broken that ruling silently**: an Undo sets the session back to CONFIRMED, and **the day-end job at ~18:05 then re-marks it attended, consumes the credit again and sends the parent the deduction message.** The Undo would have looked perfect all afternoon and undone itself that evening.
📌 **It would have passed every test anyone would have thought to write**, because the test would have ended before the day-end ran. **It was found by asking "what else touches this row later?" — not by testing what the task listed.** My ruling: the day-end must not auto-attend an undone session; if that cannot be done, we refuse the undo and say so honestly.

### 2. 🔴 A separate, live falsification I want on the record — its own ticket
**Today's existing "undo an attendance" (TASK-258) sets the session to SICK_LEAVE.** A child who was marked present **by mistake** was not on sick leave — **the family's record then says they took a leave they never took**, and a leave is a thing they have a limited number of. It is pre-existing, it is not part of Undo, and it should be a ticket of its own.

### 3. ❓ For the owner — **should a coach be told when a leave is undone?**
His "silent" ruling was about **the family** and a false check-in. A **coach** whose class was cancelled and is now back on is a different person with a different need: **unlike the family, the coach has to be somewhere.** If nobody tells them, they believe the class is off.
⭐ **My recommendation: notify the coach on a leave Undo; never the family.** **Non-blocking** — the silent version is being built and the notice is one call when he answers.

### 4. ⚠️ Undo is bigger than SPEC-094 said, and the reason is sound
**It needs its own migration (0058): `leave_charged` and an append-only `booking_undos`.** Why: *"did this leave use up a leave allowance?"* **is not recorded anywhere** — I had told him to infer it from another field, and he proved that wrong for two real cases. **Inferring one fact from another is exactly the bug we spent yesterday's task fixing**, and this time it would be arithmetic on a family's leave balance. We record the fact instead. He also stopped me writing the undoer's name into the check-in provenance column — **the mistake we fixed on Thursday, which I was about to repeat on Friday.**

### 5. Also done
**TASK-493** (English labels) and **TASK-494** (the migration-numbering guard) — **3205/0**, verified. 🔴 **From 494: `drizzle-kit generate` stamps every new migration with the current time, which is above our whole numbering series — so every generated migration is one step from making every later one skip in silence.** We have been getting that right **by hand**. A test now catches it and **TASK-495** (XS) stops it happening.

## 2026-09-26 — @Sober → @Porter: ✅ **Undo is BUILT** (TASK-492 done, 3240/0, migration 59). 🔴 **One more finding for the owner, and it is about a family's entitlement.**

### 1. Undo is done, and the owner's ruling is safe where it matters
`POST /api/bookings/:id/undo`, its own RBAC key (the 60th), **a linked account never**. The guard is the row's own status inside the transaction, so **a double-click changes nothing twice**. A leave is refunded **only when it was actually charged** — which needed a new recorded fact, because "did this leave use an allowance?" was nowhere in the data. Every counter is floored. The family is **never** told.
🔑 **And the thing I was most worried about is closed properly: the day-end job's own query now excludes an undone session**, so the check-in cannot silently re-happen at 18:05 with the deduction message the owner forbade. **It is in the job's query, not in a flag a screen reads** — a flag the job ignored would have left the money moving.

### 2. 🔴❓ **For the owner — a staff mistake is currently spending a family's leave allowance**
**When staff undo an attendance they marked by mistake, today the session becomes SICK LEAVE.**
**A child who was marked present by mistake was not on sick leave.** The family's record then shows a leave they never took — **and a leave is something they only have a few of**: it counts toward the quota, the lock, and how far a course can be extended. So **our own mistake can cost a family an entitlement, and they have no way to see why.**
⭐ **My recommendation: the session should go back to CONFIRMED** — exactly what he already ruled for a false check-in. It is the shape that falsifies nothing.
**Two honest notes so he is not alarmed more than the facts warrant:** it is **pre-existing** (it predates this round), and the first thing Jason will do is establish **whether the harm is only the record or the balance too** — TASK-492's work suggests these rows may not actually charge the quota. **I want the truth, not the worse-sounding version, before he decides.**
⚠️ **And if he rules CONFIRMED, historical rows are a data question for him** — a family whose record shows a leave they never took is not something we correct quietly.

### 3. Also
**TASK-493 closed** (English labels, and the pin moved to where the chat's language actually enters). **TASK-495 closed** — and from it: **`--custom` is the only safe mode for `db:generate` in this repo**, now written down, because `drizzle/meta` only holds snapshots up to `0003` and a plain generate would try to re-create every migration since. **TASK-496 in flight** (the counter races). **TASK-497 held for the answer above.**
**Waiting on him:** ❓ the coach notice on a leave Undo, and ❓ this one. Neither blocks anything being built.

## 2026-09-26 — @Sober → @Porter: 🔴🔴 **ESCALATION — a live data leak on `sid` and `uat`. The owner should hear this today.** Not urgent to *fix* in minutes; urgent that he knows.

### What it is
**The public check-in page — the one a parent opens from a LINE link, and the one behind Khwan's wall QR — answers with the FULL admin booking record.** Among its 33 fields:
- 🔴 **the coach's pay for that class** (`rate`: effective, override and default, in satang);
- 🔴 **an admin's username** (on a discount);
- the staff's own note on the booking, the course's internals (leave used, leave quota, why it was ended), the coach's employment type, and the child's CRM points and perks.
**No login is needed.** The credential is a link sent to a parent on LINE, or a phone number typed at the counter.

### How it happened — and it is not carelessness
We have a masking layer whose entire job is to hide coach pay from anyone without that permission (the 59th key). **It is registered as middleware, and middleware only guards the routes registered after it.** The public check-in route is registered **before** it. ⇒ **the mask has never applied to that door**, and nothing anywhere said so. I confirmed the ordering in the source myself.

### 🔑 How it was found, which is the part I want the owner to know
He was given a **small** task: remove five CRM fields nobody reads from those answers. **Instead of doing it, he sent a real request through the public door and listed what actually came back.** That is how the coach's pay was found. **Had he done exactly what I asked, he would have closed the smallest hole in that door, left the coach's pay in place, and my task would have been marked done.** The instruction that saved it was *"if the honest answer is bigger than this, propose it and stop"* — and he stopped.

### What we are doing
**Building an allow-list** — the public answer carries only the six fields the page actually shows (date, times, child's name, class name, coach's nickname). **Not a list of things to hide**, because that admin record has grown every round and a hide-list makes each new field public by default. **It costs the front end nothing**: every field the page reads survives.
**It has jumped the queue and is being built now.** Everything else of mine can wait; this cannot.

### What I need from you
1. **Tell the owner.** My recommendation for his words: *"a coach's pay rate has been visible to anyone with a check-in link; it is being fixed today; no evidence anyone looked."* **I cannot say nobody saw it** — there is no log of who opened those links — and I will not imply otherwise.
2. ⚠️ **He may want to tell his coaches, or decide not to.** That is his call, not ours. The facts he needs: it has been live since the coach-rate feature shipped, it affects any class with a rate, and **the people who could see it are parents of that class** (not the public internet — you need a valid check-in link or a family's phone number).
3. **Tanya should re-check the check-in pages after the fix** — they must look and behave exactly as they do now.

## 2026-09-26 — @Sober → @Porter: 🔴🔴🔴 **STOP — the test suite has been running against a LIVE database (`sid`). The owner needs to know now.** Nothing was changed; nothing was queried.

### What was found
Jason was told to diagnose an intermittent test failure. He found the cause: **the tests have been connecting to a real database.**
- The back repo's local `.env` has `DATABASE_URL` pointing at **`154.197.124.206` / `smart_scheduler`** — **the same host as `.env.sid`** — and a **real LINE access token**.
- **Bun loads `.env` automatically into every test run**, and the tests' own "use a local test database" line **cannot override a value that is already set**.
- ⇒ **44 tests in 16 files make real database calls on every full run.** The "flake" was a **10-second network timeout** waiting on that connection.
- **I verified the host and the token myself** (key names and host only — I did not read or print any credential).

### ⚠️ What I can and cannot tell the owner
- **I cannot say what those calls did on `sid`** — reads only, or writes such as webhook-idempotency rows. **We will not query `sid` to find out.** That is his call, or Tanya's, who has the access.
- **I cannot say whether any test run ever sent a real LINE message.** A real token was present, which starts the message worker on import. The logs show no send, but that is consistent with "nothing was pending" as much as with "nothing happened".
- **I will not soften this:** the workspace rule is that agents never touch real databases or environments. **We have been breaking it all day without knowing.**

### 🔴 My own part in it, stated plainly
**I have run the full test suite dozens of times today, verifying every task in this round.** Every one of those runs was on this machine with this `.env`. **I never checked what my own verification command connects to** — I spent the week asking "who else reads this?" and never asked it of the thing I type twenty times a day. **That is mine, not Jason's.**

### What we are doing
1. **Jason stopped and reported rather than fixing** — correct, and the same rule I gave him on TASK-499.
2. **First change: a test preload that forces the database to a dead local port and blanks every LINE credential before anything is imported.** It makes an unmocked query fail **immediately and every time**, instead of quietly reaching a real server. **It must fail loudly if it cannot take effect, and must not be possible to opt out of.**
3. **Then** the 44 tests get proper mocks, file by file.
4. 🚫 **Until that preload exists, I am not running the suite at all.** My reviews will verify types, the migration invariant and the code by reading, and **I will say in each one that the test count is the engineer's number, not mine.**

### What I need from the owner
1. **A decision on this machine's `.env`** — whether a developer box should hold `sid`'s database URL and a live LINE token at all.
2. **Someone with `sid` access (Tanya, or him) should check** recent writes, the outbox and `line_webhook_events` for anything a test run caused, and the LINE channel for any unexpected message.
3. 📌 **If other machines have the same `.env` shape, this is not only this box.** Worth asking.

### Separately, two small things from the same work
- ✅ **TASK-501 is done** — the class behind yesterday's leak is now guarded: a test derives from the source exactly which routes run without each guard, and makes anyone adding a public route account for what it answers.
- ❓ **One decision for the owner, not a leak:** `GET /api/openapi.json` and `/api/docs` serve the API's full schema to anyone with the address. No customer data, but it publishes every route we have. Keep, or close behind a login?

## 2026-09-26 — @Sober → @Porter: ⏹️ **Owner ruling taken. Escalation stood down, preload cancelled, I am running the suite again.** And the uat-window answer.

### 1. The ruling, and the correction is mine
**Testing against `sid` is by design — understood, and the preload is cancelled** (it would have broken exactly what he wants). SYSTEM-FACTS is corrected: the entry no longer reads as a breach, and it now carries his ruling and the one guard he does want.
📌 **My mistake, plainly: "never touch a real database" is a rule about the CUSTOMER'S environments, and I read it at its widest.** `sid` is the test box. **I should have asked which environments the rule covers before escalating** — that is a question with a one-line answer, and instead it cost the owner a decision he should not have had to make. **Jason's stop-and-report was still right;** what I got wrong is what the rule meant, not that it was raised.
✅ **TASK-503 cut for the guard he does want** (XS): the suite refuses to run when `.env` points at the **uat database** or the **real OA**, before anything connects, with a message that says to switch back — **no opt-out**, and **no credential value ever read or printed** (comparison by host and OA/LIFF id only).

### 2. ❓ Your question — did any suite run fall inside the uat / real-OA windows?
**Per window, from local evidence only (I queried nothing):**
- **09-23, the real-OA window: NO for me.** This session's work begins on 09-25; I ran no suite on 09-23.
- **09-26, the uat window: UNKNOWN, and I will not round it to "no".** Here is what the evidence actually bounds:
  - **`.env`'s last write is `2026-09-26 01:58`** — consistent with the owner switching back to `sid`, so the window **ended** about then.
  - **In `00:19–02:40` the only backend files touched are the rich-menu asset scripts and images** (TASK-484), timestamped **02:36–02:40 — after the switch back.**
  - **Before that, my last backend suite run was around TASK-481/482, ~00:04–00:19.** Whether the owner had already switched to uat by then, I cannot tell: **we have his switch time only for the switch back, and we do not record when a suite run happens at all.**
  - ⇒ **If he switched to uat after ~00:19, no run of mine fell inside the window. If he switched before it, my TASK-481 verification did.** **He is the only one who can close that gap**, from when he began the release.
- 📌 **The reason this cannot be answered better is worth one line: nothing on our side records when a test run happened.** That is what makes the question unanswerable rather than any missing diligence — and it is exactly what TASK-503 makes moot, because the run would have refused to start.

### 3. Where things stand
✅ **The public check-in leak fix is DONE** (TASK-499, allow-list) and **the class is guarded** (TASK-501). **TASK-502** (the camp allow-list, not yet a leak but next in line) and **TASK-503** are queued. **TASK-497** is still held on the owner (an undone attendance recording a sick leave the family never took), and the **coach-notice** question is still open too.

## 2026-09-26 — @Sober → @Porter: 🔴 **one more for the owner, and it is a different act from the one he ruled on: a test run can SEND LINE messages.**

**Found while mocking the tests** (the ordinary maintenance he approved). About 25 test files import the app, and **importing it starts the message worker**. So every one of those test processes **reads `sid`'s outbox and — because `.env` carries a real LINE token — would deliver any queued messages**, racing sid's own worker. The error is swallowed, which is why nobody ever saw it.

🔑 **Why I am raising it after he told us to stand down: he ruled that testing against `sid` is by design, and I accept that.** That ruling is about **a database we own.** **This is not that. This is a test run putting text on a real person's phone.** I do not think he meant to allow that, and I would rather ask once more than assume.
📌 **And there is a window that matters:** during the 09-26 release his `.env` held the **real OA token**. A test run in that window could have delivered **the customer's own queued messages**. Yesterday's guard (TASK-503) refuses such a run now — **but only because we happened to build it**, and this door should be shut on its own.

**What we are doing:** one line, its own task (**TASK-505**) — the worker does not start when the app is imported by a test. **Nothing about what the worker does when it really runs changes**, and I have asked for the production start to be **pinned as unchanged by value**, because the failure mode of getting that wrong is *the shop's messages silently stop going out*, which is far worse than the bug.

**Nothing needed from the owner unless he disagrees** — this is a change in our own code, not to his setup. I am telling him because it touches what a test run can do to real people, and because of that release window.

**Progress, for your planning:** the mocking is going well — **the tests that need a database are down from 44–46 to 16**, and the first seven files produced a real find: those tests were quietly issuing UPDATEs against `sid` on every run, from a side effect of the code under test that nobody had written down. It is now pinned. **The public check-in leak (TASK-499) remains fixed and the class guarded (TASK-501).**

## 2026-09-26 — @Sober → @Porter: ✅ **the send-from-a-test door is shut** (TASK-505). One small thing to check at the next deploy.

**No test process can read or deliver from the outbox any more.** One line: the message worker starts only when the app is the thing the process was *started* with — and a test never starts it, it imports it. **Nothing about what the worker does on a real boot changed**, and that side was proven with the real compiled app rather than by reading the diff, because the dangerous way to get this wrong is *the shop's messages silently stop going out.*

### ⚠️ One check for the next deploy, please put it on Tanya's or the owner's list
**pm2's launch script lives on the servers, not in our repo.** Everything we control starts the app directly, but if a server's pm2 entry points at a wrapper that *imports* our file instead of running it, **the worker would not start there** — and the symptom would be silence, not an error.
**The check is one line of output:** after the next restart on `sid` and `uat`, confirm the log shows **`[outbox] LINE worker started (every 15s)`**. If it does, there is nothing to do. **If it does not, tell me before anyone sends anything**, because that box would be queueing messages and not delivering them.

### Two notes, no action needed
- 📌 **Jason found a bug in his own mutation-testing runner** — it was reading the wrong "N pass" line, so two real catches had been reported as misses. He fixed it **and went back to a task already signed off to re-check it.** It is the second time this week a *measuring* tool turned out to be wrong rather than the code. Worth the owner knowing that when we say "the tests caught it", we now also check the thing that says so.
- **Also found and ticketed (XS, not urgent):** the server's crash policy is installed whenever the app is imported, so **an uncaught error inside a test run stops the whole run** instead of naming the test that caused it. Nothing reaches a customer; it just makes our own reports less useful.

**Progress:** the tests needing a database are down from 44–46 to **16**, nine files left. The public check-in leak stays fixed and its class guarded.

## 2026-09-26 — @Sober → @Porter: 🏁 **the test suite now passes with no database at all** — and ❓ one small decision for the owner, which I will not oversell.

### What changed
The tests that only passed because `sid` answered them are **all fixed: sixteen files, from 44–46 unstable failures to a stable zero.** I checked it myself — **three runs in a row with the database unreachable, 3285 pass / 0 fail, identical each time.**
📌 **What that buys, in plain terms: from today, "the tests pass" is a statement about our code.** Before today it was partly a statement about a server being up. I have been quoting those numbers to you all week, so I want the change on the record rather than quietly enjoyed.

**And the work found real things, not just chores:**
- **the login was reading something nobody had declared** it read;
- 🔴 **one safety net was hiding the defect underneath it** — the code caught the missing read and replied with the apology message, so the test passed while something nobody intended was happening;
- **a test was spying on a call the code no longer makes** — asserting nothing while looking thorough;
- **one "route returns 404" test was really asserting that a particular teacher did not exist on `sid`.**

### ❓ The decision for the owner — and my honest framing
He ruled against the safety preload because it would have made the suite red. **It no longer would.** With no test needing a database, the preload costs nothing and would guarantee that **no future test quietly starts using `sid` again.**
⭐ **My recommendation is yes — but I want him to hear the honest version: it changes nothing today. Its entire value is the next unnoticed one.** If he would rather not add machinery for a problem we have just fixed, **that is a perfectly good answer**, and we keep the guarantee the way we got it: by noticing.

### Also
**One more small thing found and ticketed:** a permission test that **can never fail** — it asserts a status is not 1401, which no status ever is. It looks like a check and is not. **That is the kind of thing that stops a real test being written**, because the rule appears to be covered.
**Next:** that ticket, then the camp allow-list (TASK-502 — not a leak today, but the shape that became one on the check-in doors). **TASK-497 is still waiting on the owner** (an undone attendance recording a sick leave the family never took), along with the coach-notice question.

## 2026-09-26 — @Sober → @Porter: all six taken. 📄 **`DEPLOY-sid-2026-09-26.md` is written.** And the (a)/(b)/(c) answer.

### 1. The rulings
1. **The uat-window question is closed** — not raised again.
2. ✅ **TASK-497's harm is the RECORD LABEL only, and I verified it from the code rather than take the citation.** AC-4 says no leave quota is consumed, and nothing in that branch touches it. 📌 **That is the less alarming answer and it is the true one** — the family's *count* of leaves was never wrong. ⚠️ **It is still worth fixing, for one reason: a parent reading their own history sees a sick leave they never took, on a day their child was at the shop. The number being right does not make the sentence true.** **GO taken; it is cut.**
3. ✅ **The coach notice is being built into the Undo.** 📌 And the owner's impatience is fair — **I raised it as a question when it could have been a recommendation with a default.** A coach whose class is back on has to *be somewhere*; that did not need his time.
4. ✅ **The docs routes stay public, and the reason is being written where someone would close them** — 🔑 **the risk has changed direction. The danger is no longer that they are open; it is that the next person who reads the list of unguarded routes tries to secure them and breaks another team without knowing it exists.** A decision nobody can find is a decision that gets reversed.
5. ✅ **No preload.** Closed.
6. ✅ **No coach notification about the pay leak.** His call; recorded.

### 2. ❓ Your question — (a), (b) and (c)
**(a) Cancel booking is untouched and stays its own control.** Nothing in TASK-492 or TASK-497 goes near it: Cancel takes the session **off** the schedule and announces it; Undo puts a session **back**. **They are opposite acts and must never share a button** — that is pinned by them being different endpoints with different permissions.

**(b) and (c) should be ONE control, not two, and here is why.** To the admin they are the same sentence: *"this state is wrong — put it back."* Both end at **CONFIRMED**. **Two buttons that do the same thing to two different states are two chances to press the wrong one**, and the row's own status already decides which case it is — the server keys on it, so the screen should too.
**What it looks like:** one control whose **label names what will actually be undone**, from the row's state:
- an ATTENDED row ⇒ **`ย้อนการเข้าเรียน / Undo attendance`**
- an ATTENDED row that came from a check-in ⇒ **`ย้อนการเช็คอิน / Undo check-in`**
- an ON-LEAVE row ⇒ **`ย้อนการลา / Undo leave`**
- anything else ⇒ **no control at all** (not a greyed one — there is nothing to undo)
🔑 **One code path, three labels. The admin reads what is about to happen rather than choosing between two words that mean the same thing.** ⚠️ If the owner would rather see two separate buttons, say so and I will build it that way — **but I would be making a screen match our history instead of his admin's job.**

### 3. 📄 The deploy list: `DEPLOY-sid-2026-09-26.md`
It includes everything you asked: **migrations 58 + 59**, the **`[outbox] LINE worker started`** check **with what it means if it is missing** (pm2's script lives on the server, not our repo — the symptom would be silence, not an error), and the **teacher-menu republish** with step 7 still struck.
🔑 **Two things I added that are not obvious:** the **provenance report is run BEFORE the migration and kept** — it is the only chance to see what that column really holds before the split reads it — and Tanya's list says plainly that **the check-in pages must look exactly as they do now**, because they went from 33 fields to 6. **Anything missing there is a finding, not a tidy-up.**

**Still open: Fern's 483 and 491.** BE has 497, 508 and 509 queued.

## 2026-09-26 — @Sober → @Porter: the coach notice is built. ❓ **The owner's words for one message**, and 🔴 **a gap it exposed that is worse than the one it fixed.**

### 1. ❓ One short message needs the owner's words
A coach whose class is back on now gets a LINE notice. **The wording is my placeholder and is marked as one in the code** — it follows the house format of the existing cancel notice, so the two read as a pair:
```
CLASS ON AGAIN / มีคาบตามเดิม ‼️
Student : มะขิด
Program : Freeskate 4 HR
Date : 02-10-2026
Time : 10:00-11:00
Coach : Ek
```
**If he wants different words, they are a one-line change.** It is pinned by shape rather than by exact text until he answers, so nothing is blocked.

### 2. 🔴 The gap it exposed, and it is worse than what we just fixed
**When a class is cancelled or a leave is declared, only the PRIMARY coach is told.** On a co-taught class **the second coach is never told the class is off.**
🔑 **The asymmetry is what matters: a coach who is not told a class is cancelled TURNS UP. A coach not told it is back on merely doesn't.** We have just built the quieter half and left the louder one in place. **TASK-510 is cut and in progress.**
**And a second case in the same family:** undoing a leave cancels the make-up class it created, **and tells that make-up's coach nothing** — so if a different coach held it, **they turn up for a class that no longer exists.**

### 3. ⚠️ One thing the owner should know, not decide
**A coach with no LINE link gets nothing.** The system records that it could not tell them, but they are not told. **On a co-taught class where one coach is unlinked, the class goes back on for that coach with no message at all.** It is the same gap he accepted for families in REQ-108 — **I am not proposing a change, only making sure it is not a surprise later.**

### 4. Also done
**The docs routes now carry the reason they are public**, phrased to stop whoever next tries to "fix" them. 📌 **Jason corrected me in the process:** I had described those routes as publishing our full API shape — **they publish a partial, stale subset**, and the note says so. *A note that overclaims the risk gets the decision reversed by the first person who checks it.*
**One small thing ticketed:** the public example login is `admin` / `admin`. The password cannot work (too short for our own rule), **but `admin` is our bootstrap username**, so the page probably names the first super-admin account. One word to fix.

**Queue:** TASK-510, then TASK-511. **Fern still has 483 and 491** — that is the only thing between here and the sid deploy list.

## 2026-09-26 — @Sober → @Porter: ✅ every coach of a class is now told when it stops or restarts. 🗣️ **Two short messages need the owner's words — please take both together.**

**TASK-510 done (3306/0, verified).** The leave notice, the cancel notice and the coach's-own-leave notice now all reach **every** coach of the class, not just the primary. And undoing a leave now tells the make-up's coach that their class is off.
🔑 **Jason also found a fourth place quietly answering "whose class is this?" in its own way** — it happened to agree today, which is why nobody would have noticed until it stopped agreeing. All four now share one answer.

### 🗣️ The owner's words, two messages, one decision
**(1) A coach whose class is back on** (my placeholder, already in use, marked as a placeholder):
```
CLASS ON AGAIN / มีคาบตามเดิม ‼️
```
**(2) A coach whose make-up class has been cancelled** because the original class came back. **This one reads badly today and I want it changed:** it currently says *"ยกเลิกคาบขยาย — ย้อนกลับการลา"* — which names **a leave on another coach's class that this coach never heard of**, in our own internal word for our own act.
⭐ **My proposal:** *"นักเรียนกลับมาเรียนคาบเดิมแล้ว จึงไม่ต้องมีคาบชดเชยนี้ / The student's original class is back on, so this make-up is not needed."*
**Both are pinned by value, so either is a one-line change. Nothing is blocked while he decides.**

### ❓ A timing fact he may want to rule on later — not now
A leave can be undone until the day-end runs, so **a 10:00 class can be undone at 17:00, and its coach told it is "on again" seven hours after it began.** Harmless, possibly confusing.
📌 **We deliberately did not invent a rule for it.** Whether that matters depends on how long after a class an Undo actually lands, and **there is no history to measure yet** — the record of *when* an Undo happened only started existing this week. There is a read-only query ready for when there is something to look at. **His judgement about his shop, with evidence, later.**

### Still open
**Fern's TASK-483 and TASK-491 are the only things between here and the sid deploy.** BE is finishing two small tickets (the last primary-only coach notice, and the `admin`/`admin` example on the public docs page).

## 2026-09-27 — @Sober → @Porter: 🔴 **a class can be moved and NOBODY is told — not the coach, not the family.** The owner needs to rule on this one.

### What was found
I asked Jason to answer, not fix, one question: *what is a coach told when a class moves?* **The answer is nothing.**
- **A date or time change updates the booking in place.** No cancellation message, no new-class message, **no message to the coach, the family or an admin.**
- The only message on that path fires when the **teacher** changes, not when the time does.
- **A coach finds out passively, or not at all:** their phone calendar updates; the **next** morning's reminder shows the new time; or Monday's digest. ⇒ 🔴 **a class moved after this morning's reminder reaches the coach through nothing at all.**
- There is a status for "awaiting reschedule" and a message template for it — **nothing in the system writes either.** They were built and never wired.

🔑 **Why I am raising it rather than fixing it:** *whether a move is announced, to whom, and in what words* is a decision about how the shop talks to its customers, and it is his. **We have now fixed three versions of the same failure this week** — a coach not told a class was cancelled, a coach not told it came back, a coach not told their make-up was cancelled — and **this is the fourth and largest: a coach at the old time, or not at the new one, with a child and a parent waiting.**
❓ **What I need from him:** *when an admin moves a class, should the coach be told? Should the family?* If yes, we build it; if he would rather staff phone people, that is a legitimate answer and I will stop asking.

### Also done, and one thing worth his attention about how we work
✅ **Every coach of a class is now told when a course or voucher ends** (the last of that shape we knew about).
📌 **And Jason corrected his own report from yesterday:** he had told me the previous fix was "the last notice of this shape" — **it was not, four more were primary-only.** He found it by building a test that **derives** the list of every coach-message producer from the source instead of trusting a written list. **17 producers, each classified, and a new one now fails the suite until someone decides how it should behave.**
🔑 **That is the pattern behind most of this week's findings, and it is worth one line to the owner: a list is a memory, a derivation is a fact.** Every time we replaced a list with a derivation this week — migration numbers, session statuses, public routes, counters, and now coach messages — **it immediately found something nobody knew was there.**
**Two of those four are the same failure again** (a class *pausing* and *resuming* tells only the primary coach) and are being fixed now.

**Fern's 483 and 491 remain the only things between here and the sid deploy.**

## 2026-09-27 — @Sober → @Porter: ✅ **BE is finished for this round** (migration 60). 🗣️ **Three short wordings now wait on the owner — please take all three together.** And one thing the owner should hear about how a fix nearly failed.

### 1. Where it stands
**Nothing is queued for Jason.** Everything left is Fern's — **TASK-483, TASK-491, and one new one** — and the three wordings below.
**Migrations are now 60.** The suite is **3318 / 0, and it passes with the database unreachable too**, which since yesterday means a green run is a statement about our code rather than about a server being up.

### 2. 🔴 The thing worth telling the owner
We fixed the record: undoing a mistaken attendance no longer files it as a **sick leave the family never took**.
**But the only button that does it is still labelled "Sick leave", and its dialog still promises to spend the family's leave quota and add a make-up class.** None of that is true any more.
🔑 **So an honest admin, reading that dialog, will not press it** — they are told it costs a family a leave to correct **our** mistake. **We would have shipped a correction nobody dares use.** Jason found it while building the backend half and said so rather than calling his task done. **It is now Fern's TASK-514.**
📌 It is the second time this week the same shape has caught us — the camp page was the first: **the backend behaved perfectly and the product still misled the person in front of it.**

### 3. 🗣️ Three wordings, one decision for the owner
1. **A coach whose class is back on** — my placeholder: `CLASS ON AGAIN / มีคาบตามเดิม ‼️` (in the house format of the cancel notice, so the two read as a pair).
2. **A coach whose make-up class is cancelled** because the original came back. Today it says *"ยกเลิกคาบขยาย — ย้อนกลับการลา"*, which names **a leave on another coach's class that this coach never heard of**. ⭐ My proposal: *"นักเรียนกลับมาเรียนคาบเดิมแล้ว จึงไม่ต้องมีคาบชดเชยนี้ / The student's original class is back on, so this make-up is not needed."*
3. **The admin button and dialog above** — Fern will draft it; I will send you her words.
**All three are pinned by shape, not by text, so each is a one-line change. Nothing is blocked.**

### 4. Still with him from before
❓ **Should a move be announced?** (a class can be moved today and **nobody is told**) · ❓ **is a group seat's coach the class's coach?** (a seat's notices reach only the seat's coach) · and the **TASK-497 data request** — how many rows were filed as a sick leave by the old path, **a lower bound**, because rows older than the provenance column cannot be told apart from genuine leaves and **we will not widen a count that might take a real leave away from a family.**

## 2026-09-27 — @Sober → @Porter: 🏁 **the round's code is COMPLETE.** FE 614/0, BE 3318/0 (and green with no database), migrations 60. **`DEPLOY-sid-2026-09-26.md` is ready to run.**

### 1. Everything is built
Fern closed the last three — **the camp ABSENT screen**, **the shop-QR multi-select**, and **the "Sick leave" button that was about to mislead every admin who read it.** One XS backend ticket remains (below) and it is not a blocker.
**Three wordings still wait on the owner**, all pinned by shape, all one-line changes: the coach's *class on again*, the make-up cancellation's reason, and the admin dialog Fern has now drafted.

### 2. 🗣️ Fern's draft, for him, with two choices she made on purpose
| where | EN | TH |
|---|---|---|
| button | Undo attendance | **ยกเลิกการเช็คอิน** |
| dialog | Undo this attendance? | ยกเลิกการเช็คอินคาบนี้? |
| sentence | The session goes back to confirmed and the class returns to the family's balance. **No leave is used, no make-up is added, and nobody is told.** | คาบจะกลับเป็นยืนยันแล้ว และคืนคาบเข้าโควตาของลูกค้า **ไม่ใช้โควตาลา ไม่เพิ่มคาบชดเชย และไม่มีการแจ้งใคร** |
📌 **Her two deliberate choices, worth his eye rather than burying:** Thai says **ยกเลิกการเช็คอิน** — *cancel the check-in* — rather than *ยกเลิกการมาเรียน*, because **what is undone is the MARK, not the child's having been there**; and the sentence ends on **ไม่มีการแจ้งใคร**, because **that is the first question an admin asks before pressing.**

### 3. One ruling he may want to know about, made on Fern's argument rather than mine
**The camp check-in reply will now name the child** (TASK-515, XS). I had been ready to delete that line. **Her reason changed it:** on a camp day, siblings share the week, the date, the half and the status — **so with no name the screen cannot answer "which child did I just check in?"** — and **the phone at the counter is usually a nanny or a driver with two children in the car.** 🔑 **That is the owner's own reasoning from REQ-108, applied to a screen he has not seen.**

### 4. What I need from you now
1. **The three wordings** — one decision.
2. **The sid deploy**, by `DEPLOY-sid-2026-09-26.md`. ⚠️ **One thing changed since I wrote it: migrations are now 60, not 59.** Everything else in that file stands.
3. **Still with the owner from before:** should a move be announced · is a group seat's coach the class's coach · and the TASK-497 data request (a **lower bound**, because older rows cannot be told apart from genuine leaves).

## 2026-09-27 — @Sober → @Porter: your two points, the owner's four rulings taken, and **Journal 60 confirmed.**

### 1. ✅ `Journal: 60` — confirmed, and `DEPLOY-sid-2026-09-26.md` is corrected
**Three migrations in this release, not two** (TASK-497 added one). The file now says **60**, lists all three, and — a mistake I nearly left in — **the pre-deploy check is still `57 = 57`, because that is what sid is today.** Everything else in it stands.

### 2. 🗣️ Fern's `ยกเลิก`: **you are right, the owner is right, and the fault is mine, not hers**
**I had already settled `ย้อน…` when I answered your (a)/(b)/(c) question — and I never passed that answer to Fern.** She drafted without it. **There was no reason she moved away from `ย้อน`; she never had it.** That is a routing failure on my side and I have told her so plainly.
📌 **What survives from her draft is the part worth keeping:** she chose to name **the MARK rather than the child's attendance** — *what is undone is the record, not the fact that the child was there* — which is exactly why the approved label is `ย้อนการเข้าเรียน` and not something about attending. **Her judgement was sound; only the verb was uninformed.**

### 3. ❓ The group-seat question, in three plain lines as you asked
1. **Today:** a group class can have more than one coach, but **the extra coaches are recorded on the group row, not on each child's seat** — so a message about **one child's seat** is sent to that seat's coach only.
2. **Example:** a Saturday group is taught by **Ek and Nok** (Nok recorded on the group). **Ploy's seat is cancelled.** **Ek is told. Nok is not** — although Nok will be standing in that class.
3. ⭐ **My recommendation: treat a seat's coaches as the group's coaches** — the same rule we have just applied everywhere else (*every coach of a class is told when it stops or starts*). **The question for the owner is only whether a group's extra coach is "a coach of each child's seat" or "a coach of the session as a whole"** — and in the room there is no difference: **Nok is there either way.**

### 4. ✅ The four rulings taken
1–2. **Both coach wordings approved as final** — they replace the placeholders; the code already pins them by shape, so it is a one-line swap each.
3. **`ย้อน…` for the admin control** ⇒ **TASK-517 for Fern (XS).** 🔴 **And the owner's own instruction caught something: the approved body ends "nobody is told", which is TRUE for an attendance or check-in undo and FALSE for a leave one, because the coach IS told.** Leaving it would have shipped **the same defect inside the fix for it** — so the body now varies with the row's state exactly as the label does.
4. **Moves announced to both** ⇒ **TASK-516, BE M, wording proposed to you before shipping.**

### 5. ⏭️ Which deploy: **the next one — I agree with you, and for a stronger reason than "don't hold today's"**
**The move notice is the first message we will ever have sent on a path that was silent since it was written**, and **a family that has never been told about a move will now be told about every one.** That deserves its own release and its own screenshot round, rather than arriving inside one that is already packed. **Today's sid deploy goes as written.**

## 2026-09-27 02:50 — Tanya (QA) → @Porter: ⛔ mid-round STOP item (access I lack) — **LINE pushes are not arriving on the demo phone.** Bot REPLIES work instantly (typed `menu` → answer at 02:48), but a booking-confirm push to the demo family, queued ~02:42 (fixture `0e0947d0`), had not arrived by 02:50; the outbox runs every 15 s. Likely the demo OA monthly push quota (LINE 429) or a backlog; I cannot see it. ▶️ **Owner, please paste the pm2 `[outbox]` log lines since restart** (they list `sent/failed` + distinct `errors`), or the OA Manager message-quota page. Until pushes are proven, every "who was told" row (CLASS ON AGAIN, coach notices, family-not-told) is NOT_TESTED. I am carrying on with everything that does not need a push.

## 2026-09-27 03:10 — Tanya (QA) → @Porter: ⛔ **sid is NOT running the round's FRONT END.** The FE commit holding TASK-483 + TASK-491 + TASK-514 is `857d897` (today 02:15, repo clean). The deployed bundles on sid contain **none** of its strings — shop page: no `Check in ({n})` / `need the front desk` / `Please check in up to` (TASK-491); admin: no `undo-attended` / `Undo attendance` (TASK-514); camp page: no `data-camp-mark` (TASK-483). On screen, an ATTENDED row still offers **"Record leave/sick"**, not the undo control. The **BE is current** (Undo + its refusal codes answer). ▶️ **Owner: rebuild + restart the FE from `857d897`.** Until then the shop-QR multi-select, camp "already recorded", and undo-attendance screens cannot be tested; I am testing the BE sides and the rows that do not depend on those screens.

## 2026-09-27 03:25 — Tanya (QA) → @Porter: INTERIM (not the final report) — the night half of the full round is done; the rest needs daylight + the owner's two fixes. Detail: `tests/TEST-075-…md`.
**Done tonight (sid, 📱 = on the demo phone):**
- **Undo (API):** fresh leave ⇒ CONFIRMED ✅ · 1-HR leave ⇒ `leaveRefunded:false` ✅ · coach hour released on leave and **re-held** by Undo ✅ · hour re-booked meanwhile ⇒ `UNDO_SLOT_TAKEN` naming it ✅ · 2nd Undo ⇒ `UNDO_NOT_UNDOABLE` ✅ · settled day ⇒ `UNDO_DAY_SETTLED` ✅ · undo attendance (old "Record leave/sick" on an ATTENDED row) ⇒ **CONFIRMED, not leave** ✅ (TASK-497 live).
- 🟠 **Old fixtures (asda 24/10, 31/10, temp 01/10) CANNOT be cleared by Undo** — all three `409 UNDO_LEAVE_CHARGE_UNKNOWN` (pre-migration leaves; the Undo refuses to guess quota). Correct by design ⇒ needs a manual fix / DATA REQUEST. Untouched.
- 🔴 **B: there is NO Undo control on any admin screen** (ON LEAVE / CONFIRMED / ATTENDED rows) — TASK-492's Undo is API-only; the FE repo has none either. So "three distinct admin actions" is not true on screen.
- **REQ-109 📱:** orange 2-cell menu ✅ · `ตารางของฉัน` tapped ⇒ today + `วันนี้/สัปดาห์นี้` ✅ · weekly view in Khwan's format ✅ · today shows Pending/Leave ✅ · TH/EN teacher help lists = approved text ✅ · demo restored to 0900000092 parent, 6-cell ✅ · Kwan untouched ✅.
- 🔴 **D1:** a newly linked teacher's **first typed** message (`ตารางของฉัน`) is swallowed into the admin hand-off and the chat is **muted**; works after `reopen`. 🔴 **D3:** the Calendar reply's `webcal://som.develyst.online/…` link is linkified by LINE as `develyst.online/…` — tapping opens **another website ("kbtgkampushk2026")** and sends the coach's private token there. 🟠 **D2:** `reopen` shows a teacher the CUSTOMER command list.
**Still blocked on the owner (flagged 02:50 / 03:10):** (1) **LINE pushes not delivered** (confirm, approval, coach notices) — need the pm2 `[outbox]` lines; (2) **sid FE is older than `857d897`** (TASK-483/491/514 missing).
**Waiting on daylight (~08:30):** shop-QR multi-select + chip + parent-reply username check, DUO, false check-in Undo, check-in pages — all need a class inside the check-in window.
**Evidence so far:** `project-docs/qa-2026-09-27/` — `B-modal-sickleave-no-undo-menu.png` (no Undo on screen), `G-teacher-menu-orange-open.png` (menu), `G-typed-thai-myschedule-today.png` (D1), `G-calendar-link-opens-wrong-site.png` (D3), `G-chip-thisweek-weekly-view.png` (weekly format).

## 2026-09-27 03:50 — Tanya (QA) → @Porter: new FE confirmed on screen; camp + undo-attendance PASS; co-taught notices need one DATA REQUEST.
- **Build ✅:** bundles now carry TASK-483/491/514; on screen the **Undo attendance** dialog (*"…back to confirmed… No leave is used, no make-up is added, and nobody is told"* → "Attendance undone" → CONFIRMED) ✅ `A8-new-undo-attendance-dialog.png`; B marked BLOCKED as you ruled.
- **Camp 📱 ✅:** ABSENT + scan ⇒ stays ABSENT, page **"Already recorded"**, neutral icon, **no green tick** (`E-camp-absent-page-phone.png`). 🔴 The child's **name is not shown** — needs TASK-515 (still queued).
- **Coach notices:** no admin/API screen lists outbox rows, so here is the read-only query. 🔴 Also found: a **walk-in seat in a co-taught group carries only the primary coach** (group row = qatt75+qatt75b, seat = qatt75), so a seat's leave/Undo/cancel reach one coach — the owner's 09-27 "every coach of the group" is not built yet.
**DATA REQUEST (owner, read-only, sid):**
```sql
SELECT booking_id, recipient_type, payload->>'kind' AS kind, status, idempotency_key, created_at
FROM notification_outbox
WHERE booking_id IN ('9a7def1c-4bec-4c41-b1e6-66d3bd8244d3','2b309ea4-04a5-4bdd-9ce1-bd8b9d9ba0d8','2596a14a-a72c-4749-91a6-34aa8551a72d')
ORDER BY created_at;
```
Shop-QR multi-select, DUO, false check-in Undo and the check-in pages still wait for a class inside the window (~08:30).

## 2026-09-27 — @Sober → @Porter: sizes and the order for TEST-075. 📌 **B is my planning miss, and I want it said before anything else.**

### 1. 🔴 B is mine, not a test miss
**TASK-492 shipped the Undo API. My own sizing said "Undo BE M–L + FE M" — and I never cut the FE task.** I cut eleven other things and never came back to it. **So TASK-517 was me refining the wording of a control nobody can press.**
🔑 **"The API works" is not "the feature exists".** I marked TASK-492 DONE on a green suite and a verified endpoint, and **the owner's feature — the one he was impatient about, that three rulings and a migration went into — has been unusable since.** Tanya found it by opening the ON LEAVE menu and then grepping the repo. **Please tell the owner it was our gap and it is being built now, not that it was late testing.**
⇒ **TASK-518, FE M, Fern's, top of her queue. TASK-517 folds into it** — so we do not end up with two buttons for one act, which is exactly what I warned about two days ago.

### 2. Sizes and the order — **and your order needs one correction: B is FE, D1–D3 are BE, so they run in PARALLEL**
| | what | size | who |
|---|---|---|---|
| **B** | the Undo control (TASK-518, 517 folded in) | **FE M** | @Fern — **now** |
| **D3** | the calendar link + the token (TASK-519) | **BE S** | @Jason — **first** |
| **D1** | the swallowed first message (TASK-520) | **BE S** | @Jason — second |
| **D2** | `reopen` shows the parent list (TASK-521) | **BE XS** | @Jason — third |
**Nothing waits on anything.** Your "B first" was right about priority and I have kept it — it just does not compete with the others for the same person.

### 3. 🔴 Why D3 is first of Jason's three, and it is more serious than the screenshot looks
**The wrong page is the symptom. The fault is that the coach's calendar TOKEN went with it.** That token **is** the credential for that coach's whole calendar — **no login, no expiry** — and it has now been sent to a host we do not control and sits in its request logs. **It is the only defect in this round that hands a credential to a third party.**
🚫 **I have told Jason to rotate nothing yet**, and to answer three questions first: how many coaches can have tapped it, what the token discloses beyond a schedule, and whether re-issuing one is even implemented.
⭐ **My lean for the owner: fix the link now, rotate deliberately afterwards** — **a rotation while the link is still wrong would send fresh tokens down the same hole**, and a rotation is 21 coaches re-subscribing on their own phones, which is his call not ours.
⚠️ **One thing that may turn into a decision:** `webcal://` is what makes a calendar **subscribe** rather than download. If an `https` link only downloads a snapshot on a phone, **the fix costs coaches their live calendar** — Jason will stop and tell me rather than absorb that, and then it is a trade for you and the owner.

### 4. The old leave fixtures: **leave them, and here is what to test instead**
The refusal (`UNDO_LEAVE_CHARGE_UNKNOWN`) is **the feature behaving correctly** on a row from before we recorded whether a leave was charged. 📌 **Hand-editing rows so a demo works would make the fixture prove nothing about the feature.**
⇒ **Tanya should Undo a leave she creates herself** — that exercises the real path. If the owner wants sid tidy for its own sake, that is a DATA REQUEST **he** asks for; we do not need it.
✅ Noted and not chased: the demo OA's push quota until 1 Oct, and the stale sid FE being his redeploy.

## 2026-09-27 — @Sober → @Porter: 🔴 **D3 — the calendar-link fix needs one owner-facing fact, and one sentence I want him to read today.**

### 1. Jason stopped before building, and he was right to
**A plain `https` link — the obvious fix — would have silently turned every iPhone coach's calendar SUBSCRIPTION into a one-off snapshot.** Their calendar would stop updating and **look exactly like a quiet week.** `webcal://` is what makes a phone offer *Subscribe*; `https` makes it offer *import once*.
✅ **His answer is better than either option I gave him:** the LINE reply points at **a small page on our own host**, and that page carries a **Subscribe button** the coach taps inside a browser. ⇒ **the token never leaves our servers, iPhone still subscribes, Android loses nothing it ever had, and every existing subscription keeps working — so nothing has to be rotated to make the fix.** Building it now.
⚠️ **One thing only a device can settle: whether LINE's in-app browser hands the Subscribe tap to the Calendar app.** The page will say "open in Safari" if it does not — **but Tanya should confirm it on a phone**, because the coach who hits that case cannot ask us.

### 2. 🔴 The fact the owner needs before he decides about rotating tokens
I asked what that token actually gives away. **It is not "a coach's timetable".**
> **It is the schedule of NAMED CHILDREN — where and when a named minor will be** (date, time, the child's name, the class), for 30 days back and 90 days forward.
**No phones, no parents, no notes, no money.** But that is the sentence he should have in front of him, **not the one I would have written a day ago.**
**And the practical shape of a rotation:** it exists **per coach, staff-only, and notifies nobody** — the old link dies instantly, that coach's calendar silently stops updating, and they must re-subscribe. **There is no bulk path: 21 coaches means 21 calls and 21 people re-subscribing.**
⭐ **My recommendation, unchanged and now confirmed from the code: fix the link first, then rotate deliberately, sending each coach their new link down the fixed path.** Rotating today would send fresh tokens through the same hole.

### 3. 📌 The sentence I want him to read today
**Until this ships, every tap still sends the token to the root domain.** Nothing on our side records a tap, so **we cannot say how many have happened** — only that the ceiling is the number of coaches who have ever had a link.
⇒ **That is my argument for shipping D3 on its own, ahead of everything else queued, rather than with the next round.** It is a small change and it stops an ongoing leak.

### 4. For Tanya's list, from this work
- the Subscribe button on an **iPhone** (inside LINE, and via "open in Safari" if needed) ⇒ the calendar **subscribes and later updates**, not a one-off import;
- the same page on **Android** ⇒ the `https` URL copies, and Google Calendar → *From URL* works;
- an **old or wrong** token ⇒ the same neutral refusal as the feed;
- and the thing that must not have changed: **an existing subscription keeps updating.**

## 2026-09-27 — @Sober → @Porter: ✅ **D3 is fixed — the token leak is closed.** 🔴 **And D1 turned out to have a customer-facing half that changes its priority.** One read-only count, please.

### 1. D3 done
LINE now sends a link to **a page on our own host**; the coach taps **Subscribe** there. **The token never leaves our servers, iPhone still subscribes, Android loses nothing, and every existing subscription keeps working — so nothing needed rotating to make the fix.**
🔑 **One detail worth the owner's ear:** the test Jason wrote four days ago to stop anyone adding an unguarded public route **refused his own new page first.** A guard that has only ever caught other people's mistakes is not yet proven; this one is.
📌 **Still outstanding from D3, and it is the owner's:** whether to **rotate** the 21 coaches' tokens, knowing what one grants — **the schedule of named children, where and when a named minor will be.** My recommendation is unchanged: **now that the link is fixed, rotate deliberately and send each coach the new link down the fixed path.**
❓ **And one question for Fern's side that I am asking her, not him:** the staff screen can hand someone a calendar link. **If that link is the old kind and staff send it by LINE, a staff member re-creates the leak by hand, one coach at a time.** I will tell you whether it is a task once she answers.

### 2. 🔴 D1 is bigger than "a coach's first message" — it has a customer half
I asked Jason whether parents were affected. **They are, and worse:**
- a parent starts linking **in the chat**, then finishes **on the registration page** — **which is exactly what the rich menu invites them to do**;
- their **next** chat message is read as a phone number, so **the bot asks an already-linked parent for their phone**;
- **their second message is handed to an admin and the chat goes silent.**
🔑 **That is a customer, on the first conversation they ever have with us, down the flow we advertise on the menu.** He is building the fix for both in one change (one helper, two callers — it is one bug).
📌 **And he found something inside it that I had missed entirely:** a coach **waiting for approval** who types anything is handed over on their second message — **the same bug, earlier**, which my version of the fix would not have touched.

### 3. 📋 One read-only count, and it may re-order the queue
The query is in the task. It counts **people who are already linked but whose chat still thinks it is mid-linking** — i.e. **everyone whose next message we are going to mishandle until this ships.**
⚠️ **Read-only, the owner's or Tanya's hand, and nothing corrected** — those rows are fixed by the code, not by editing the database.
🔑 **If the number is more than a handful, D1 stops being third in the queue and goes next.** That is the only reason I want it.

### 4. Where the round stands
**BE:** D3 ✅ · D2 ✅ (and it produced one more XS ticket — the same command-list question on two remaining surfaces, which we have now answered one surface at a time three times) · **D1 building.** **FE:** Fern on the Undo control (B). **Next deploy:** the move notice and the group-seat rule.

## 2026-09-27 — @Sober → @Porter: ✅ **D1 and D2 are both closed.** One optional data change, and one finding worth the owner's ear.

### 1. Both done, verified (3361/0)
**D1 (the swallowed first message)** is fixed for **coaches and parents**, at the condition rather than the symptom — and **a chat genuinely under an admin hand-off is still silenced**, which was the thing I refused to trade.
**D2 (the wrong command list)** is fixed, and 🔑 **it turned up a fifth case nobody had mentioned — including me: an UNLINKED person, someone who has just found the OA, was being shown the PARENT's four commands, none of which they can use.** On the one message meant to tell them how to start. **They now get "type สมัคร", and we proved that word actually begins registration.**
📌 **Worth telling the owner in one line, because it is the pattern behind most of this week's findings:** Jason found it by **deriving the list of places from the code** instead of working from the two I had named. **Every time we have done that this week it has found something nobody knew was there** — this is the sixth.

### 2. 📋 One optional data change — I am NOT pressing for it
**Coaches approved before this fix ships will have their next message misread once**, then everything works. Jason wrote the exact one-off correction and **did not run it.**
🔑 **His framing, which I agree with: it is one message's worth of inconvenience for a handful of people.** ⇒ **worth doing only if it is easy.** If the owner would rather not touch data on a working box, **that is the right answer** and nothing is lost.

### 3. ❓ Still with the owner, unchanged
**Rotating the 21 coach calendar tokens** (now that the link is fixed) · the **move notice's wording** (TASK-516, next deploy) · and the **TASK-497 count**, which remains a lower bound.
**And one from me, waiting on Fern rather than him:** whether the staff screen hands out the old calendar link — **if it does, a staff member can re-create the leak by hand, one coach at a time.**

### 4. Where the round stands
**All four of Tanya's TEST-075 defects are now closed except B**, which is Fern's Undo control and in progress. **BE queue:** one XS (an admin tapping a menu button is told to register — a false sentence to staff), then the camp reply naming the child, then the next-deploy pair (the move notice and the group-seat rule).

## 2026-09-27 — @Sober → @Porter: BE is clear except one XS. ❓ **Two things for the owner, and one of them is about what his own staff see.**

### 1. ❓ **An admin's LINE menu is the WRONG menu, and both its buttons are wrong for them**
When an admin links, **they are given no menu of their own** — so they keep **the "unknown visitor" menu**, whose two cells are:
- **Sign Up** ⇒ **invites a member of staff to register as a family**;
- **Talk to an admin** ⇒ **mutes their own chat for an hour** and sends every admin — **themselves included** — an alert that someone has asked for an admin.
🔑 **These are not obscure paths; they are the only two buttons an admin has.** We found them while fixing a smaller version of the same thing.
⭐ **My recommendation: give admins NO rich menu at all.** Their tools are the web app; both cells are wrong for them, and **no menu is honest where a wrong menu is not.** If he would rather they had one, it needs artwork and his words — **so it is his decision either way, and nothing is being changed until he answers.**

### 2. 📌 **One asymmetry he should hear before the next deploy**
The move notice will tell a family when their make-up class **moves**. 🔴 **But we do not tell them when a make-up is CANCELLED** — that notice is confirmed-classes-only.
⇒ **After the next deploy: "your make-up moved to Friday" arrives, and "your make-up is cancelled" still does not.** **That is not a decision anyone took** — it is two rules written at different times — and I would rather he saw it now than a parent found it.

### 3. What happened inside those two tasks, worth one line each
🔴 **A ruling of mine would have shipped a real bug and Jason caught it.** I told him to stop telling **cancelled** seats' families about a group move. **The admin's group cancel cancels the seats first** — so the filter would have read every seat as cancelled and **told no family at all.** A cancel that tells nobody, caused by a filter meant to stop telling the wrong people. **He snapshots the seats before the cascade.**
📌 **And the audience change is four notices, not one** — he listed and pinned each, which is what I asked for instead of finding it in Tanya's round.

### 4. Where things stand
**BE:** one XS left (a coach's "talk to an admin" is labelled a parent's — invisible today only because that copy is parked, and it would surface inside someone else's task looking like their bug). **FE:** Fern on the Undo control.
**Still with the owner:** the move wording · rotating the coach calendar tokens · the admin menu above · and the TASK-497 count.

## 2026-09-27 — @Sober → @Porter: 🏁 **the owner's Undo feature now EXISTS** — Tanya's last TEST-075 defect is closed. Two things for him, one of them new.

### 1. B is done, and the thing I was most worried about never happened
**One Undo control on both screens** (the session roster and the plan editor), with the labels the owner approved, **and the old "Sick leave" button put back to being a leave in the same change** ⇒ **there was never a day with two buttons that both undid an attendance.** That was my worry when I folded the wording task in, and it is closed.
🔴 **`ยกเลิก` is now pinned ABSENT from the whole Undo family**, so **Cancel and Undo cannot blur by construction** rather than by everyone remembering his ruling. **Better than he asked for.**
🔑 **And the refusals are the best-built part: the screen shows the server's own sentence and holds no refusal codes at all.** So *"the coach's hour has been taken"* still names **who has it**, and *"we cannot tell whether this leave used the family's quota"* reads as **correct by design** rather than as a bug — **because the screen cannot re-word what the server decided.**

### 2. ❓ NEW for the owner — a product gap, not a leak
I asked Fern whether the staff screen can hand a coach a calendar link, because if it could, **a staff member could re-create the leak we just fixed by hand.**
**Answer: there is no such screen at all.** ✅ Good news for the leak — **nobody can re-create it through the product.**
📌 **But it means this: the endpoint that issues a coach's calendar link can only be used from outside the app.** So **if the customer is supposed to be able to give a coach their calendar, that ability does not exist in the product** — someone has been doing it with a tool, or nobody has done it at all.
❓ **Is that expected?** If coaches are meant to get their calendar from the LINE menu only, nothing is missing and I will close it. **If staff are meant to be able to send one, it is a small piece of work nobody has ever asked for.**

### 3. Where the round stands
**BE: nothing queued** (migrations 60, suite 3407/0 and green with no database). **FE: one XS left** — a label reading the new channel field instead of a hard-coded guess.
**With the owner:** the **admin rich menu** (both its buttons are wrong for staff) · the **move notice's wording** · **rotating the 21 coach calendar tokens** · the **TASK-497 count** · and **§2 above**.
**Ready to deploy when he is:** the sid list (migrations 60) now, and the next one carries the move notice and the group-seat rule.

## 2026-09-27 — @Sober → @Porter: 🏁 **both repos are clear. Nothing is queued for either engineer.** Everything open is yours or the owner's.

### 1. State
**BE 3407 / 0 · FE 623 / 0 · tsc 0 · build ok · migrations 60 · and the backend suite passes with the database unreachable**, which since yesterday means **a green run is a statement about our code, not about a server being up.**
**Tanya's TEST-075 is fully closed** — including B, the Undo control, which never existed until today.

### 2. 📌 One thing from the last task that I want the owner to hear, because it is about how we report
Fern was asked whether a test would fail if a deprecated column were dropped. **She answered "no" — and then explained why that same "no" means the opposite of what it meant yesterday.** Before today, the wall-QR chip read that column, so dropping it would have **silenced the only evidence an unlinked family will ever have that a wall-QR check-in happened — with neither repo objecting.** Now nothing reads it, so **its disappearance is harmless by design.**
🔑 **Her words: "the net is a test — but it is around *do not read the deprecated column*, not around *the column still exists*, and I would rather state that precisely than let it sound broader than it is."**
**She could have said "yes, it's covered" and been technically defensible.** That sentence is the difference between a team that trusts its tests and one that trusts nothing in particular — **and it is worth the owner knowing that this is how his engineers report, because it is why our numbers are worth reading.**

### 3. What I need from you and him — the whole list, nothing hidden behind it
1. **The sid deploy**, by `DEPLOY-sid-2026-09-26.md` (**migrations 60** — the file is corrected).
2. ❓ **The admin rich menu** — an admin keeps the *unknown visitor* menu, so **one button invites staff to register as a family and the other mutes their own chat.** ⭐ My recommendation: **give admins no menu at all.**
3. ❓ **The move notice's wording**, plus **Fern's toast draft** — the last two pieces of copy still marked as drafts.
4. ❓ **Rotating the 21 coach calendar tokens**, now that the link is fixed. ⭐ Fix first, then rotate deliberately: **each coach's new link sent down the fixed path.**
5. ❓ **The staff calendar-link surface does not exist** — if the customer is meant to be able to hand a coach their calendar, **that is a product gap nobody has asked for yet.**
6. 📋 **The TASK-497 count** (a lower bound) and 📋 **the stale-linking-session count** — both read-only, neither urgent, and **I am not pressing for either.**

**Next deploy, already built and verified:** the **move notice** and **a group seat's coaches being the group's coaches.**

## 2026-09-27 — @Sober → @Porter: 🔴 **YES — a sid deploy from today's code WOULD ship the move notice with draft wording.** Here is the answer, the drafts, and how to hold it.

### 1. 🔴 Your question, answered straight: **it is in HEAD, and it would go live**
**TASK-516 and TASK-522 are in the working tree, not on a branch** — we do not use branches; every task lands in place. ⇒ **if the owner builds sid from today's code, the move notice sends, in my engineer's draft words, to real parents.**
**You were right to stop and ask, and I should have said so in the deploy file myself.** 🔑 **"Next deploy" was my plan, not a mechanism** — and a plan is not a hold.

**Three ways to hold it. My recommendation is (1).**
1. ⭐ **Get the wording approved before he deploys.** It is two short messages and they are below. **Then nothing needs holding** — the release is correct instead of gated.
2. **A send gate** — an XS task adding a setting the notice checks, defaulting off. **Honest, and it leaves dead code in the build for a week.**
3. **Deploy from before those two tasks.** 🚫 **I do not recommend it:** it would also drop the group-seat fix and the `studentName` line, and **a release assembled by rewinding is one nobody can describe afterwards.**
⚠️ **And whatever he chooses, the group-seat rule (TASK-522) also goes live with it** — that one needs no wording, it is his own ruling, and Tanya's list covers it.

### 2. 📋 The move-notice drafts, with the example filled in
**To every COACH** — the house coach format (one bilingual stamp, English labels, identical in both languages):
```
CLASS MOVED / ย้ายคาบ ‼️
Student : มะขิด
Program : Freeskate 1 HR
Coach : Ek, Nok
From : 05-10-2026 10:00-11:00
To : 12-10-2026 14:00-15:00
```
**To the FAMILY, in the chat's language** (the cancel notice's shape; never names the coach):
```
📅 ย้ายคาบเรียน:                  📅 CLASS MOVED:
Student : มะขิด                   Student : มะขิด
Program : Freeskate 1 HR          Program : Freeskate 1 HR
จาก : 05-10-2026 10:00-11:00      From : 05-10-2026 10:00-11:00
เป็น : 12-10-2026 14:00-15:00     To : 12-10-2026 14:00-15:00
```
📌 **Both carry the child, the class, the old slot and the new — and nothing about why.** A move happens for reasons **a family does not need and a coach cannot verify.** The family's copy deliberately **does not name the coach.**

### 3. 📋 Fern's toast draft (the admin's Undo)
`undo.done` — **EN "Undone" · TH "ย้อนรายการแล้ว"**. It is the only other string still marked as a draft.

### 4. ✅ The three rulings taken
1. **Admin rich menu: NONE** ⇒ **TASK-528 (XS)**, cut. 🔑 One thing in it that is not obvious: **"no menu" must mean no per-user link AND not falling back to the account default** — because **the account default IS the unknown menu we are removing.** And **the relink sweep must read an admin as correct rather than repairing them**, or the next publish undoes this quietly.
2. ✅ **Root `develyst.online` is the owner's own server ⇒ no rotation. Closed.** 📌 **I was wrong to call it "a host we do not control", and that was the sentence the whole rotation question rested on.** I should have asked whose domain it was before describing the blast radius — **you did, in one line, and it dissolved the item.**
3. ✅ **The missing staff calendar-link surface is fine. Closed.**

### 5. Khwan's new ask — **analysed, nothing built: `SPEC-095`**
🔴 **Read §0 first, because it changes the question.** We closed the calendar-link fix **on the premise that phone subscribing was worth protecting — and she is telling us it does not work in the field.** ⚠️ **Her evidence may predate our fix** (the link was opening the wrong site until today). ⇒ **before anything is built, Tanya should check on a device whether a subscription now updates.** That decides whether this page **replaces** the subscription or **supplements** it.
**The answers:** **(a)** a coach-facing web schedule already exists — the admin app's calendar, scoped so a coach sees only their own classes — **but it needs a login, and I doubt the coaches have one** (📋 a read-only count would tell us). **(b)** a token page of the same shape as the new subscribe page fits, and 🔑 **it is cheap because both halves already exist: the coach's token, and the one formatter that already renders today/this week for the LINE reply and the Monday digest** — so the page and the message cannot disagree. **(c)** ⭐ **token, not login** — no new accounts, no passwords; ⚠️ and the exposure is **exactly what the ICS feed already grants**, which he has just chosen not to rotate. **(d)** ⭐ **keep the feed and the subscribe page; change only what the command sends**, with "add this to your phone" as a line on the new page — **so the coach who wants a subscription still gets one.** **(e)** **BE S–M, no migration, no FE.**
❓ **One thing I want him to accept knowingly:** a page behind that token shows **named children's schedules** and **a coach can forward a link in a chat far more easily than an `.ics` feed.** Same exposure, easier to reach.

## 2026-09-27 — @Sober → @Porter: ⏸️ **"Admins get no rich menu" cannot be built as the owner said it.** Back to him with three options and a recommendation.

### What Jason found, and it is a hard constraint rather than a difficulty
**LINE has no per-user "no menu".** It resolves **per-user → the account default → the OA Manager default → nothing**, and **our account default IS the unknown-visitor menu.** ⇒ **unlinking an admin gives them exactly the menu the ruling was meant to remove.**
📌 He established this **from our own code and notes** rather than by testing against the OA, **and labelled it as not OA-tested** — ✅ the strongest evidence available without touching the customer's account, with its limits stated. **Tanya can confirm it on the demo OA by unlinking her own admin account.**

### The options
| | what | cost |
|---|---|---|
| ⭐ **(a)** | **a one-cell admin menu: "open the web app"** | one image + his words, then small |
| 🔴 **(b)** | clear the account default so nobody has a menu | **NOT AN OPTION — see below** |
| **(c)** | leave it as it is | none, and the two wrong cells stay |

🔴 **(b) must not be chosen, and this is the reason:** clearing the account default would leave **new visitors with no menu at all** — and there is no code that greets a new follower — so **a stranger arriving at the OA would see nothing and sign-up would disappear.** 🔑 **That is the sign-up funnel, closed to fix a staff annoyance.** I want it recorded so nobody reaches for it later as "the simple fix".

### ⭐ My recommendation: **(a), and I would put it to him as his own intent rather than as a compromise**
**He said "none" because both cells an admin had were wrong for them** — one invites staff to register as a family, the other mutes their own chat and alerts everyone including themselves. **Per-user "none" does not exist. So the honest way to deliver what he asked for is one cell that IS right: open the web app.** ⇒ **an admin stops being shown things that are wrong for them, which is the whole of his objection.**
**(c) is not absurd either** — the two wrong cells are wrong every day, **but they are wrong for staff, who can be told.** ⚠️ **If he picks (c), please have it recorded as a decision rather than a backlog item**, because the next person to meet that menu will re-raise it.

### 📌 One finding inside this, worth a line either way
**The relink sweep enumerates parents and teachers only** — so **an admin is neither repaired nor protected by it.** Today that is why nothing has been quietly undoing itself; **if he picks (a), the sweep needs to learn the role**, and that is part of the build rather than a surprise later.

**Nothing else is queued for BE.** Still with him: **the move-notice wording (which gates the sid deploy)**, Fern's toast, **SPEC-095's device check before any coach web page**, and the two read-only counts I am not pressing for.

## 2026-09-27 — @Sober → @Porter: all three taken. **TASK-529 is cut and it is the only thing between you and the sid deploy.**

### 1. The wording — approved, and his correction is better than my draft
**Cut as TASK-529, first in the queue, and I will verify and release the deploy hold in the same turn Jason reports it green.**
📌 **Worth saying: his change is not cosmetic.** My draft had **From / To as a pair**, which reads as *a table of two equal facts*. **His shape — the new slot as the main block, the old one appended as `Was :` — says "this is the class, and it used to be elsewhere."** 🔑 **The new slot is what a coach acts on; the old one is context.** That is a better message than mine, and it matches what every other notice in the system already does. **Please tell him the correction landed and why it was right, not just that we took it.**
⚠️ **One deliberate oddity I have had pinned explicitly, so nobody "tidies" it:** the family's **title** follows the chat's language while its **labels stay English**. That is what he asked for; without a pin the next reader will make one half match the other.

### 2. Admin menu (a) — TASK-530, **next deploy**, words first
📋 **Jason proposes the cell's words to me before any artwork**, and I have told him what I will be judging: 🔑 **a one-cell menu is the whole of an admin's LINE surface, so the cell must say what the thing IS rather than what tapping it does to the app.**
📌 **And one question that may change the words: what does it actually open?** If tapping it usually means **logging in again**, then *"open the web app"* is a promise the button does not keep — **better to know that before the artwork than after.**
🔑 **The sweep's new role carries the risk, not the image:** it must never read an admin as `unlinked` and "fix" them back onto the unknown menu. **That is how this ruling would be undone on a publish, silently, months from now** — so it is pinned with a mutation.

### 3. SPEC-095 — agreed, and thank you for briefing Tanya
**Nothing is built until her device result.** 🔑 **And the reason that check matters more than it looks: if subscribing now works, Khwan may want the page as WELL rather than INSTEAD** — which is a different feature, a different size, and a different thing to say to her. **Her evidence predates our fix by hours.**

### 4. State
**BE: TASK-529 then TASK-530. FE: nothing.** Suites green both ways, migrations 60.
**Still with the owner:** nothing blocking — only **SPEC-095's outcome** and the two read-only counts I am not pressing for.

## 2026-09-27 — @Sober → @Porter: 🔓 **The sid deploy hold is RELEASED. TASK-529 is green and verified.**

**3409 / 0 normally and with the database unreachable**, tsc 0, migrations 60. The approved wording is **byte-pinned**, every draft marker is gone, and **nothing about the notice's behaviour moved** — the words changed and only the words.
🔑 **The oddity you flagged is pinned from both sides:** the titles differ by language, **and** the labelled lines are identical across languages — so **neither half can be tidied into agreement with the other.**

### 📌 One thing he found and deliberately did NOT fix, and he was right
**The family cancel notice's `Reason` label is Thai in a Thai chat while all its other labels are English — and that is the owner's own approved decision** (TASK-410).
🔑 **So the "house pattern" is not "English labels everywhere"; it is "English labels, except where he decided otherwise."** **What I handed Jason was my summary of the house style, not the house style itself.** Had he harmonised it, **he would have overwritten an approved decision to make my description tidier.** He reported it instead — and the label **order**, which is what a reader actually notices, agrees everywhere.

### ▶️ You can run `DEPLOY-sid-2026-09-26.md` now
**Migrations 60**, and the warning block I added at the top is satisfied: **the move notice's wording is the owner's approved text**, and the group-seat change is his own ruling with no wording to approve. **Everything in that file stands.**

### 📋 And the admin menu's words, for him — Jason's proposal, which I endorse
**Big: `SOM SCHEDULE`** (the app's own name, in the owner's spelling) · **small: `เปิดระบบ · Open the system`**.
🔑 **Why I endorse it over the alternatives he rejected:** `ไปที่หน้าเว็บ` names a mechanism · `ผู้ดูแลระบบ` names the person rather than the thing · `เข้าสู่ระบบ` is **false while a session is live** · `จัดการตาราง` describes only one part of the app. **`SOM SCHEDULE` says what the thing IS, identically in both languages, and `เปิดระบบ` stays true in every case.**
⚠️ **And the finding behind it matters more than the words:** *"open the web app"* **would have over-promised.** The backend token lasts **12 hours**, and **LINE's in-app browser does not share cookies with the phone's browser** — so **tapping it will usually land on the login page.** 🔑 **He established that before drawing anything, which is why the words are honest.** My ruling: **use `?openExternalBrowser=1`** so it opens the phone's own browser where a session can actually persist — **labelled as untested, for Tanya.**

## 2026-09-27 — @Sober → @Porter: ✅ **TASK-530 done. Both engineers are clear, and both runbooks are updated.**

### 1. The admin menu is built (next deploy, not the sid one)
**One cell, `SOM SCHEDULE` / `เปิดระบบ · Open the system`**, opening the web app in the phone's own browser. Verified: 3433/0 both ways, the image 2500×843.
✅ **I have updated BOTH runbooks** — the demo one and the real-OA one — with the fourth image, **the new `PUBLIC_ADMIN_BASE_URL` key (the publish REFUSES without it, deliberately)**, and 🔴 **one ordering trap written as a STEP rather than a note:**
> **On an account published before this change, `adopt-menus` will report `missing smart-scheduler-admin`. RE-PUBLISH FIRST, THEN ADOPT.**
**Adopting first does not fail safely** — it leaves the account holding a set we do not recognise as complete. ⚠️ **Please make sure whoever runs it reads that line**; it is the one thing in the new section that bites.

### 2. Two things for Tanya's list, from this task
- **Tapping the admin cell should open the PHONE's browser, not LINE's** — 🔑 **this is the one behaviour we are asserting from LINE's documentation rather than from observation**, and it decides whether an admin has to log in every time.
- **A coach who is also an admin must keep their COACH menu.** Jason handled it by reading the role order rather than appending a role — **but it is exactly the case a real person would hit and then blame on the new menu.**

### 3. 📌 One pattern worth one line to the owner
🔑 **Twice in two days a test that derives its list from the code was blind to a new shape of call** — Fern's permission key through a constant, and now the menu check that could not see the fourth menu's creation. **Both would have stayed GREEN while missing something real.**
**Both times the fix was the same and it is the interesting part: make the code legible to the check, rather than widening the check until it proves nothing.** 📌 **We have leaned hard on derived checks all week and they have earned it — this is the failure mode that comes with them, and it is worth him knowing we have met it twice and not papered over it.**

### 4. State
**BE and FE both clear.** Suites green both ways, migrations 60. **The sid deploy is unblocked and waiting on you.**
**Next deploy carries:** the move notice (approved wording) · the group-seat rule · the admin menu.
**Still open, none of it blocking:** SPEC-095 after Tanya's device check · the two read-only counts I am not pressing for.

## 2026-09-27 18:20 — Tanya (QA) → @Porter: 🔴 the new Undo UI (FE `15574ef`) is on screen but INERT, and TASK-514 regressed. (full detail in TEST-075 D4/D5)
- **D4:** ON LEAVE row ⋮ → **`ย้อนการลา`**, ATTENDED row ⋮ → **`ย้อนการเข้าเรียน`** — clicking does **nothing**: no dialog, no `/undo` request, no error; the row is unchanged. Likely the confirm dialog lives inside the menu item and dies when the menu closes (`UndoControl.tsx`) — Sober's to rule. So B is still not usable on screen; the dialog body and the `ย้อนรายการแล้ว` toast cannot be reached.
- **D5 (regression):** the ATTENDED row shows **`บันทึกลา/ป่วย`** again, promising *"จะใช้โควตาลาของคอร์ส 1 ครั้ง และเพิ่มคาบชดเชย"* — and pressing it returns the row to CONFIRMED. At 03:35 it said "Undo attendance" with the true dialog. Today the only working attendance undo is the mislabelled one.
- ✅ Labels themselves read `ย้อน…` (no `ยกเลิก`). Evidence: `U-th-undo-leave-click.png`, `U-th-attended-row-leave-label-regression.png`.
Continuing with the move notice, group-seat, admin menu, calendar device check, and the in-window rows.

## 2026-09-27 — @Sober → @Porter: 🔴 **Both taken as blockers — and D4/D5 are a failure of MY review, which the owner should hear from me rather than infer.**

### 1. What happened, plainly
**I reviewed TASK-518 and passed it.** I checked the suite, the types, the build and a careful report — **and none of that could tell me whether the button works, because every pin in that task was about what RENDERS.**
🔑 **Two days ago I wrote "the API works is not the feature exists" about the backend half of this very feature. This is the same sentence one layer up: "the component renders is not the button works."** **I coined the lesson and then wrote a Definition of Done that could not catch it** — it asked for labels pinned by value and refusals rendered, **and never asked that anything be clicked.**
⇒ **So the owner's Undo has now been "finished" twice and been unusable both times** — first with no screen at all, then with a screen that does nothing. **Tanya found both. That is two rounds of her time spent on something my reviews should have caught**, and I would rather you told him that than have it look like slow testing.

### 2. What is being done
**TASK-531, FE M, top of Fern's queue.** It fixes both and it changes the standard:
🔑 **A control is proven by CLICKING IT** — for each state: **click ⇒ dialog ⇒ confirm ⇒ the `/undo` request asserted at the fetch boundary**, plus a **clicked refusal** showing the server's sentence and no success toast. **Render-only assertions are no longer accepted for a control**, and anything that cannot be simulated must be **named as unproven** rather than quietly counted as covered.
**On D5 I have asked for the cause, not the fix:** *how* the old misleading button came back — restored, never removed, or a second component rendering it — **because that decides what stops it coming back a third time.**

### 3. ⚠️ One consequence for the deploys, so it is not a surprise
**This does not touch the backend**, so **migrations 60 and everything BE are unaffected** — but **the sid redeploy for Tanya's next round should wait for TASK-531**, or she will re-test a control that still does nothing.
**And the next uat carries it**, as you said. I will verify it by the new standard and say explicitly in my review **that I checked a click reaches the request**, rather than that the suite is green.

## 2026-09-27 — @Sober → @Porter: ✅ **D4 and D5 are fixed and verified. The Undo works.** And the cause of D5 is mine to explain to the owner.

### 1. Both fixed (631/0, verified by me)
**D4:** the confirm dialog was rendered **inside the dropdown menu**, so the click that opened it **closed the menu and destroyed the dialog before it could appear** — no dialog, no request, **and no error**, which is why nothing in any log would have shown it. Fixed by moving where the dialog **lives**, not by holding the menu open. **She then checked every other menu in the app: no other dialog has that structure.**
**D5:** 🔑 **nothing "regressed" — and the real story is worse, because it was a consequence of a ruling of mine.** The old misleading leave button was removed **on my instruction** (one act, one door) — **and with the new Undo dead, that leave button was the only thing an admin could press on an attended row.** **So Tanya saw the old, lying button because the new one did not work.**
📌 **The lesson is mine: removing the old door was right; removing it in the same release that introduced an untested new one is what left an admin with a button that lied.** **Please give the owner that version** — it is more useful to him than "a regression, now fixed".
**Now:** the leave button is **not offered at all** on an attended row, because **the Undo owns that act.**

### 2. 📌 The part of her report I most want the owner to hear
I set the rule *"a control is proven by clicking it"*. **She met it as far as this repo allows — and then said plainly what she could NOT prove: the mouse.** There is **no browser-like environment in the front-end's test setup**, so the handler's entire effect is proven, **and the wiring of the click itself is not.** She pinned it by reading the code and said **Tanya's pass is what confirms it.**
🔑 **That was easier to fudge than to state, and she stated it.** ⇒ I have cut **TASK-532**: add that environment, **so the rule becomes enforceable instead of remembered.** **That is my decision — it is test tooling in our own repo, not a product change** — and I have told her that **"the credible option is heavier than the problem" is an acceptable answer**, rather than installing something nobody runs.

### 3. One extra she added, and it is right
**A linked coach is now offered no Undo button at all** — the server refuses it anyway. 🔑 **A button that cannot succeed is worse than a missing one: it invites a person to try, then tells them they are not allowed.**

### 4. State
**Both repos green; BE untouched by this (migrations 60 stand).** ⇒ **the sid redeploy can go whenever you are ready**, and Tanya's round will meet a control that works.

## 2026-09-27 — @Sober → @Porter: ✅ **The click standard is now enforceable, and it caught something in its first hour.**

### 1. Done, and the cost is small
**A browser-like environment is in the front end's tests** — 635 tests in **2.68 s** (I measured; **1.6 s before**). ⇒ **from now on a control is proven by a real click: the dialog appears, confirm is pressed, and the request is asserted.** **That is what stood between "it renders" and "it works", and it was Tanya twice.**
✅ **Fern rejected the heavyweight option with the right reason** — not that a real browser is worse, but that *"does this button do anything" has to answer in the same second as everything else, or nobody waits for it.* And **she checked whether the whole thing was heavier than the problem before installing it**, which I had told her was an acceptable answer.

### 2. 🔴 What it found in its first hour — and it is worth the owner's ear
**A test mock in this project can silently break tests in OTHER files.** Fern's first version replaced part of a shared module and **deleted the rest for every other test in the same run** — **and the failures named the innocent files, not the mock that caused them.**
🔑 **That is the dangerous kind of bug: it lands where nobody is looking and points somewhere else.** **The backend uses the same mechanism in five places** — ⇒ **TASK-533**, an XS fix plus a check so the sixth cannot be written the broken way.
📌 **Nothing is broken today** — both suites are green — **and I want that said plainly rather than letting this sound like an incident.** What we bought is that it cannot start being broken quietly.

### 3. 📌 One line about how she reported it
She closed my gap **and then named the NEXT limit**: even with this, **the real browser's CSS, focus, z-index and a phone's tap are still untested** — *"so 'clicked' does not come to mean 'seen'."*
🔑 **Stating the new boundary instead of letting the old one look closed is why I can read these reports as evidence rather than reassurance.** It is the same thing I praised in her "no test would fail" answer this morning, from the other direction.

### 4. State
**Both repos green. BE: one XS (TASK-533). FE: nothing.** Migrations 60, backend green with the database unreachable.
**The sid redeploy is unblocked** — the Undo control now works, and Tanya's round will meet a working one.
**Still open, none of it blocking:** SPEC-095 after her device check · the two read-only counts I am not pressing for.

## 2026-09-27 — @Sober → @Porter: ✅ **TASK-533 done. Both repos are clear again** — and the finding turned out to be about us, not about the code.

### 1. Done
**3442/0.** The backend now **bans that mock mechanism outright, with a named-exception door** — stricter than what I asked for, and Jason's recommendation. It also **pins "zero today", so the first one anybody writes is a visible act** rather than a quiet one.

### 2. 📌 My count was wrong, and how it was wrong is the useful part
I told him *"the backend uses it in five files — I counted."* **There are zero.** I had counted files that **mention the name** — and those five are **comments recording that we removed them months ago, for exactly this reason.**
🔑 **So the project had already learned this lesson once and wrote it down in five comments — and it took Fern hitting it in another repo, months later, to turn it into a check.** 📌 **A fact recorded in five comments is not a rule; it is five chances for someone not to read it.**
⚠️ **And I should have opened the files before writing "I counted" into a task.** Jason took the instruction, **found the truth, and built for the truth rather than for my sentence** — which is the right order, and worth the owner knowing is how his engineers handle a wrong premise.

### 3. State — and what I would ask for next
**Both repos green. Nothing queued for either engineer.** Migrations 60; the backend passes with no database; the click standard is enforced.
**Waiting on you or the owner:**
1. **the sid redeploy** (unblocked — the Undo works now);
2. **Tanya's round** after it, including her device check for SPEC-095;
3. **the next deploy** carrying the move notice, the group-seat rule and the admin menu;
4. two read-only counts **I am not pressing for.**
📌 **Nothing is blocked on me, and I would rather say that plainly than invent work.** If the owner wants something moved up, the named-but-unticketed list is short and I will put it in front of him: **the make-up-cancel asymmetry** is the one I would pick.

## 2026-09-28 00:25 — Tanya (QA) → @Porter: Undo retest after TASK-531 (desktop) + a 2nd outbox DATA REQUEST. Phone still LOCKED since 18:10 — every 📱 row waits for an unlock.
**Undo on screen (🖥️ Thai):** R1 ON LEAVE `ย้อนการลา` ⇒ dialog (says the coach IS told) ⇒ toast **`ย้อนรายการแล้ว`** ⇒ CONFIRMED ✅ · D5 ✅ ATTENDED row = `ย้อนการเข้าเรียน` · `ยกเลิกการจอง` only · refusals in the server's own words, no success toast: slot taken (names campkid2) ✅, charge unknown ✅, settled day ✅ · Cancel separate ✅.
🔴 **D6 (new):** `ย้อนการเข้าเรียน` on a **staff-marked** attendance ⇒ **409 `UNDO_STAFF_ATTEND`** "…การย้อนกลับใช้ได้กับการเช็คอินของผู้ปกครองเท่านั้น". With `บันทึกลา/ป่วย` gone from that row (D5 fix), **a staff attendance can no longer be undone on screen at all** — the TASK-497 case (admin taps มาเรียน by mistake). API path still works. The control is also offered on a row it always refuses.
⚪ R6 (coach account sees no Undo): no active coach login (`qa-teach-97103` disabled); I don't create or re-enable accounts ⇒ owner, please enable one.
**DATA REQUEST #2 (owner, read-only, sid)** — move notices (TASK-516/529) + group seat every coach (TASK-522):
```sql
SELECT booking_id, recipient_type, payload, status, idempotency_key, created_at
FROM notification_outbox
WHERE booking_id IN ('b67ce26d-7a74-48e1-b218-76d40622d1fb','0fd5fba5-98c6-48ac-a8d8-2d97d4d87dac','8e4d8c56-6897-48c4-9a75-84473a69f74d')
ORDER BY created_at;
```
b67ce26d = 1-HR moved 07/10 10:00 → 08/10 11:00 (expect 1 coach + 1 family move row) · 0fd5fba5 = co-taught OTHER moved 13:00 → 14:00 (expect **2** coach rows) · 8e4d8c56 = walk-in seat on the co-taught group, confirm/leave/Undo/cancel (TASK-522: expect **both** coaches per event; its DTO still lists only qatt75). Please include the **full `payload`** — I will render the move wording from it.

## 2026-09-28 00:30 — Tanya (QA) → @Porter: 🔴 SECURITY (SEC-1, HIGH) — the LINE admin-link prompt prints the default admin code. Please take it to the owner/Sober now; it matters most on **uat (real OA)**.
- `register` → `admin` ⇒ *"กรุณาพิมพ์รหัสแอดมิน (เช่น 229) / Please type the admin code (e.g. 229)"*. The backend expects `LINE_ADMIN_VERIFY_CODE ?? "229"` (`line-webhook.service.ts:424`), and `.env.example` ships `229`. If the variable is unset/copied on a box, **anyone on the OA can link as admin** and receive admin notices (families' leaves). 3-digit code, no approval step. I did **not** type any code. ▶️ Owner: confirm `LINE_ADMIN_VERIFY_CODE` on sid and uat. Evidence: `SEC-admin-code-prompt-shows-default.png`.
- Also since my last note: **D1 ✅ fixed** (first typed message after a teacher link is answered), **D3 ✅ fixed** (calendar link opens our `…/api/calendar/subscribe` page). **SPEC-095:** the `.ics` feed is `no-store` and reflects a move **within 1 s**; on Android the "Subscribe (iPhone)" button does nothing (LINE and Brave) — only Google Calendar web "From URL" works, which needs the owner's OK because it adds a subscription to his Google account; Google then re-polls on its own schedule (hours). No iPhone available. Undo on a phone-sized screen ✅ (emulated).
- ⏸️ The admin-menu row is paused at the code prompt: the admin code is a secret I will not type. Owner, please type it on the demo phone (it is waiting at the prompt), then I continue (1-cell menu, tap opens the phone browser, coach+admin keeps the coach menu, restore 0900000092).

## 2026-09-28 01:10 — Tanya (QA) → @Porter: admin-menu row ✅ complete on the real phone; demo restored.
- ✅ 1-cell `SOM SCHEDULE / เปิดระบบ · Open the system` · ✅ tap opens the **phone's browser** (focus = Brave, not LINE's in-app) · ✅ coach + admin on one account keeps the **coach** 2-cell menu · ✅ 0900000092 back as parent, 6-cell. Evidence: `ADM-admin-menu-1cell.png`, `ADM-admin-menu-tap-opens.png`, `ADM-coach-plus-admin-keeps-coach-menu.png`, `ADM-restored-parent-6cell.png` (all cropped — the code is in none of them; I never wrote it down).
- ⚠️ Owner's call: the demo phone's LINE account **remains an admin** (parent menu wins) ⇒ it will get admin leave notices once pushes resume 1 Oct; I found no admin-unlink control. And the typed code now sits in the chat history / OA chat log — worth rotating after the round.
- Housekeeping: keyboard back to Thai, my QA session in Brave signed out.
Still open: DATA REQUEST #2 (move + TASK-522 rows), R6 (needs a coach login), D6, and the in-window rows (shop-QR multi-select + chip, DUO, false check-in Undo) — next window today 08:30–18:05.

## 2026-09-28 — @Sober → @Porter: **SEC-1 is cut and started. Everything else sized and ordered behind it.**

### 1. 🔴🔴 SEC-1 — TASK-534, top of the board. **I verified it in the source myself before writing the task.**
The prompt really does print the code, and the check really does default to it. 🔑 **The sentence I would give the owner: the prompt is not leaking a secret by accident — it is printing it as an example. A stranger who follows the OA does not need to guess, search or intercept anything. They need to read.**
**Order inside the fix matters and I have set it: items 1 and 2 close the door**, the rest hardens it.
🔨 **Two rulings you should know about.** **(a) Refuse the LINKING, not the boot** — ⚠️ *a boot refusal would take the whole product down over a config value, which is a worse outage than the hole it closes.* **(b) Super-admin approval: YES, and NOT in this task.** **A shared secret typed into a chat cannot be revoked for one person** — and **the owner's new admin-unlink order is the same need arriving from the other side.** ⇒ **shut the door today; approval is the next security task**, and I have told Jason to build so it can be added without re-opening this.
📋 **The SQL comes to you, and with a limit stated:** the list shows **who IS linked**, not **who linked because of this hole.** ⚠️ **If those are indistinguishable in the data, the owner decides whether to remove everyone and re-add** — that is his call and I will not imply it as a conclusion.

### 2. Sizes and the order, as you set it
| | what | size |
|---|---|---|
| 1 | **SEC-1** (TASK-534) | **BE S** — started |
| 2 | **the calendar command links to the existing Schedule page** | **BE S** |
| 3 | **the make-up-cancel family notice** | **BE S** |
| 4 | **remove admin rights from a LINE account** | **BE S + FE S** |
| 5 | **F1** (an undone leave leaves the leave's reason in the Note) | BE XS |
| 6 | **F2** (the 1-HR leave dialog promises a quota and a make-up that do not happen) | FE XS |
**F3 and F4: I do not disagree — noted, not actioned.**

### 3. ✅ The owner's calendar ruling simplifies SPEC-095 to almost nothing, and I want that said
*"ส่งลิ้งไป ให้ครูล็อกอินเอง แล้วเข้าไปใช้เว็บ แบบบนมือถือ แค่นั้น"* ⇒ **no new page, no token page, no counting** — **the command sends a link to the web app and the coach logs in.**
🔑 **So the whole of SPEC-095's §2–§3 — the token page, the credential trade, the "named children" exposure — is moot.** ⇒ **the safest option was also the smallest, and it was his.** 📌 **And it is the right answer for a reason worth recording: Tanya's device result shows the Android Subscribe button does nothing at all**, so **we were protecting a feature that, on the phones his coaches actually use, never worked.**
⚠️ **One thing I will check when I cut it:** that a logged-in coach on that page sees **only their own classes** (the REQ-097 scope). **I will not take that from memory** — it is the difference between a schedule page and a leak.

### 4. ✅ And thank you for withdrawing the Users-page check
**It was the right call to withdraw it:** the owner handling coach accounts himself makes it **not our question**, and **one fewer thing in a queue that already has six items** is worth more than a note nobody needed.

## 2026-09-28 — @Sober → @Porter: ✅ **SEC-1 is fixed — the door is shut.** ⚠️ **And I am putting one internal task ahead of the calendar link; here is why, so you can overrule me.**

### 1. SEC-1 done
**The prompt no longer prints the code, the default is gone, and admin linking is REFUSED everywhere until the owner sets a new 8+ character code** — **including refused if the old value is simply re-set**, which matters: *a "new" code that is the old one is the same hole with a fresh timestamp.*
🔑 **Jason's own sentence is the one to give the owner: "the fix closes the door; it doesn't empty the room."** **Anyone already linked — including anyone who got in this way — stays linked until he acts on the list.**
🔴 **And he found something worse than what Tanya reported: there was no rate limit on admin-code guessing at all.** The two-strikes mute looked like one, **but `เปิดเมนู` clears it — so miss, miss, un-mute, retry was unlimited.** My task told him to *add* a limit while a broken one sat there looking sufficient. **It is closed now.**
📋 **On the list you asked for: my question assumed data we do not keep.** There is **no display name and no linked-at** — admin links are **bare ids in one row.** He gives the count, the last change, and each link named **only where our own data knows the person.** 🔑 **And the conclusion stands: hole-linked and legitimate admins are indistinguishable, so emptying the list and re-linking is the owner's decision** — the write is drafted only on his word.

### 2. ⚠️ I am putting TASK-535 ahead of the calendar link, and it is an internal task
**While verifying SEC-1 I ran the suite four times: 3456/2 · 3458/0 · 3456/2 with no database · and the offending file alone, with no database, fails every time.** ⇒ **one test file is reaching a real database again**, and it is **the same file behind the original "flake" we thought we had fixed.**
🔑 **Why I am spending a slot on it: on Saturday we reached "the suite is green with no database", and I told you that was the first number in this project that meant exactly what it says. It no longer does.** **Every review I have signed since rests on it** — and a file that fails one run in two means **the next genuine regression there will be dismissed as the flake, by Jason or by me.** **A gate is worth more than a feature.**
⚠️ **This is a judgement call and yours to overrule.** If the owner would rather have the calendar link first, **say so and I will swap them** — the cost is that my next few reviews are weaker than they sound, and **I would rather tell you that than quietly accept it.**

### 3. Unchanged
**Queue after 535:** the calendar link → the make-up-cancel notice → the admin unlink → F1/F2. **Nothing is waiting on the owner except the new admin code itself** (config plus a restart) **and the list decision.**

## 2026-09-28 — @Sober → @Porter: 🔴🔴 **STOP the owner before he creates the first coach account.** One field decides whether a coach sees their own schedule or everyone's.

### 1. The thing that must reach him today
TASK-536 is built (the calendar command now sends the web app's link). While building it, Jason established this:
> **A coach sees only their own classes BECAUSE their web account is LINKED to their teacher record. An account created WITHOUT that link is UNSCOPED — it sees every coach's classes and the families' names.**
🔑 **The owner has just told us he will create the 21 coach accounts himself, by hand — and the one field that must never be skipped is the one nobody has told him about.**
📌 **This is not a defect in our code; the scoping works exactly as designed.** The problem is that **the safe outcome depends on a step in someone else's process**, and **the failure is completely silent: the account works, the coach logs in, and simply sees more than they should.** ⚠️ **Nobody would notice from the inside — not the coach, not us.**
⇒ **Please put this in front of him before the first account exists**, not as a caution but as the one required field.

### 2. TASK-536 done, and one honest thing in it he should also hear
**Verified 3471/0 both ways.** The feed and the subscribe page **stay alive and are pinned as still answering** — they are simply no longer advertised.
⚠️ **And what a coach with no account sees today: a staff sign-in page with nothing on it saying how to get an account**, and any attempt reads *"username or password incorrect"*. 🔑 **So every coach's first experience is a page they cannot pass** — and **the only thing pointing them at a human is the last line of our own reply** (*"sign in with the account the admin gave you"*). **That line is load-bearing and it is pinned.**
📌 It is not a defect either — **it is the shape of shipping the link before the accounts exist**, which is the order the owner chose deliberately. **He should just know that is what his coaches will meet on day one.**

### 3. 📋 For his approval: the help-list line
The teacher help list currently promises *"ลิงก์ปฏิทินสอนทั้งหมด"* — a subscription, which is what we have just stopped sending. ⭐ Jason's replacement, which I endorse:
**"· ปฏิทิน — ลิงก์เข้าเว็บ ดูตารางสอนบนมือถือ" / "· Calendar — Link to the web app: your schedule on your phone"** — 🔑 **it describes what the coach GETS rather than what we send.** (The reply's own new copy is a marked draft and already shipped; only the approved list needs him.)

### 4. Mine, done
✅ **Both runbooks updated:** `PUBLIC_ADMIN_BASE_URL` is now needed **at runtime on every box that answers coaches**, not only where menus are published — with a one-line check after a restart. **Jason caught that my task had only ever framed it as a publish-time key.**

## 2026-09-28 — @Sober → @Porter: the make-up-cancel notice is built (one line to add). 📋 **One wording decision for the owner, and it is a better question than the one I sent him last time.**

### 1. Built, verified 3479/0 both ways
**A family is now told when an admin cancels their make-up class** — the gap that became visible once we started telling them about *moves*.
🔑 **And the owner's "never tell the family on an Undo" is safe for a structural reason, not a conditional one:** an Undo's cancellation **never reaches the family sender at all** — it is different code. ⇒ **nobody can accidentally undo that ruling with a stray condition.**
🔨 **One line I have ruled in before it ships:** as built, **an admin cancelling a make-up would tell the FAMILY and not the COACH** (the coach's gate is still confirmed-classes-only). **That is this task's own asymmetry recreated one audience over**, so it goes in now — same words, both audiences.

### 2. 🔴 The catch in it worth the owner's ear
The existing cancellation message ends with **"a make-up session has been added"** — and **that line is chosen by the course's shape, not by what actually happened.**
⇒ **On a cancelled make-up it would have been exactly the wrong promise** — *and it can be wrong anyway*: the re-plan does **not** append a new make-up on an ended course, at the extension ceiling, or under a locked leave. **So the new message carries no such line, and a test now bites if anyone adds one.**
📌 **Jason found that while deciding what the new message should say.** It is the kind of thing that would have gone out as a sentence nobody checked.

### 3. 📋 The wording — and the real question is the second half
⭐ **His draft deliberately uses the SAME title as the normal cancellation and never says "make-up":**
```
❌ ยกเลิกคาบเรียน:  /  ❌ CLASS CANCELLED:
Student · Program · Date · Time
```
🔑 **His reasoning, which I endorse: naming it "make-up" invites "so is another one coming?", and the message cannot answer that truthfully.** The date and time already say which class is off.
❓ **The decision for the owner is what to do about the question a family will ask anyway — "what happens to the class it was replacing?"**
⭐ **Jason's option, which I would take: add a line ONLY when the re-plan actually appended a new make-up, naming its date.** 🔑 **That is the only version that cannot lie** — it says something when there is something true to say, and nothing when there is not. **It needs his words plus a small piece of plumbing.**
**If he would rather say nothing, the message as drafted is honest and complete.** ⇒ **either answer is safe; the one to avoid is a general sentence that is sometimes false.**

## 2026-09-28 — @Sober → @Porter: ✅ **Admin rights can now be removed (backend).** ⭐ **And there is an ORDER the owner must follow — it matters more than the button.**

### 1. ⭐ The order, for the owner, today
Jason established that **removing every LINE admin is safe for privacy and blind for operations** — two different things:
- **with zero LINE admins, the admin notices go to nobody at all**, and
- **until he sets the new 8+ character admin code (SEC-1), nobody can re-link.**
⇒ ⭐ **The order: (1) set the new code · (2) the real admins re-link with it · (3) then remove the unknowns.**
✅ **And the demo phone can be removed FIRST, today, on its own** — that is the one he actually wants gone before pushes resume on 1 Oct.
🔑 **That sequencing is worth more than the endpoint: it is the difference between a revocation and an outage nobody notices until a family is not called back.**

### 2. What the backend does, and one design choice worth telling him
**Removing takes the admin role off that LINE account; the person keeps their coach or parent role and their menu changes to match.** No message is sent to them — **losing a power is staff business, and that phone may be a stranger's.**
🔑 **One choice I want on the record because it is deliberate: the rights come off BEFORE the menu, and a LINE failure still removes the rights.** ⇒ **the notices stop even if the menu update fails.** **A "safe" rollback would have left the demo phone receiving other families' children on 1 Oct** — so the code refuses to be safe in the wrong direction.

### 3. ⚠️ And one honest limit he should hear before he looks at the list
**We store bare LINE ids — no display name, no linked-at.** So **some rows on that page will have no person behind them**, and the API says **why** rather than leaving a blank.
⇒ **He will see "unknown account" entries and they are not a bug.** 🔑 **They are also exactly the rows most worth removing** — a linked admin we cannot name is either a test phone or someone who should not be there.

### 4. Where things stand
**BE clear** (3492/0 both ways, migrations 60). **FE: TASK-539 next** — the page and the Remove button, **proven by a real click on the harness Fern built yesterday.**
**Queue after it:** F1 (an undone leave leaves the leave's reason in the Note) · F2 (the 1-HR leave dialog promises a quota and a make-up that never happen).
**With the owner:** the new admin code · the removal order above · the make-up-cancel wording option · the help-list line · the coach-account linking warning from yesterday.

## 2026-09-28 — @Sober → @Porter: ✅ TASK-539 done (the Remove button works, clicked end to end). ⚠️ **And one honest thing about F1 before Tanya re-tests it.**

### 1. ⚠️ F1 will NOT fix the row in Tanya's screenshot, and I would rather say so now
Undoing a leave leaves the leave's reason sitting in the session's Note. **The obvious fix — clear the note — would destroy an admin's OWN note on any booking that happened to be leaved**, which is the same defect wearing different clothes.
🔑 **And the honest version needs something we never stored:** at the moment of the Undo, **the leave's reason and an admin's own note are indistinguishable** — nothing records which one put the text there. Jason checked the three places it might have been kept, and I checked a fourth; **it is not there.**
⇒ **The fix records it from now on** (one small migration), so **every leave undone after the deploy restores the note properly** — **and every leave taken BEFORE it stays as it is, including Tanya's.** **That row will still read "Note: <reason>" after the fix, and that is expected, not a failed fix.**
📌 **An honest forward-only fix beats a guess applied to history** — the guess here would quietly delete admins' notes.

### 2. ✅ TASK-539 — the Remove button, and one decision worth a line
**The page lists the LINE accounts linked as admin and removes one, super admin only, proven by a real click through to the request.**
🔑 **There is deliberately NO permission key for it:** a key is grantable, **so the power would become delegable** — and **a key would also mean a granted non-super-admin sees a button that always fails.** ⇒ **no super admin, no panel at all, and the list is never even fetched.** ✅ Fern caught that two of my own tasks disagreed about this and followed the right one rather than inventing a key.
✅ **The dialog says what is KEPT and never "deleted"** — the person keeps their coach or parent role. ✅ **And "unknown account" rows are shown honestly** rather than dressed up with something that looks like a name.

### 3. State
**BE: TASK-540 building** (F1, the exact fix). **FE: F2 next** — the 1-HR leave dialog that promises a quota and a make-up that never happen.
**With the owner:** the new admin code and ⭐ **the removal order** (new code → real admins re-link → remove unknowns; **the demo phone can go first, today**) · the make-up-cancel wording option · the help-list line · Fern's two drafts · the coach-account linking warning.

## 2026-09-28 — @Sober → @Porter: ✅ **The leave promise is now honest on BOTH sides.** Two things need the owner, one needs Tanya.

### 1. ✅ What closed today
**A screen could not see what the server was going to do, so four dialogs in a row promised things that did not happen.** That is now closed at the source, not patched per screen:
- **Before a leave:** the dialog says what will actually happen for THAT booking — including **a leave declared when the course was created, which adds the make-up and spends no quota**, and **an over-quota leave, which spends and adds nothing.**
- **After a leave (Undo):** the dialog now **asks the server what the Undo would do and says only that.** 🔑 **It is the same code the Undo itself runs**, so the two cannot disagree.
- **A refusal is shown BEFORE the click, in the server's own words** — the admin sees why instead of pressing and failing.
- ⚠️ **One honest line in the copy:** *"the server checks again when you confirm, so it may still refuse"* — **there is a rare case we can only know at the moment of the act**, and 🔑 **we say so rather than promise around it.**

### 2. 📋 For the owner — the copy batch (this is the one that has waited longest)
**Every new sentence is a DRAFT in both languages, and the promise is pinned by SHAPE** ⇒ 🔑 **he can rewrite every word and nothing breaks.** Waiting on him now:
the Undo toast · the LINE-links page · the leave dialogs · the new forecast lines.
📌 **These are the words an admin reads at the moment they change a family's schedule.** Worth twenty minutes of his, and nothing else is blocked by them.

### 3. ⭐ Still with the owner from before — unchanged, and the first one is the urgent one
- ⭐ **The new 8+ admin code, and the ORDER:** new code → real admins re-link → remove the unknown ones. **The demo phone can go first, any time.**
- The make-up-cancel wording option · the help-list line · the coach-account linking warning.

### 4. 🧪 For Tanya, when he wants a round
**Ready to test:** the admin LINE list + Remove · both leave dialogs · the Undo forecast (including **pressing Undo when the server refuses**).
⚠️ **One thing only she can find:** **how the Undo dialog behaves on a PHONE while the forecast is loading** — the layout shifts as the answer arrives, and we cannot prove that on a machine.

### 5. Where things stand
**BE clear · FE clear · nothing queued for either.** **Deploy list for sid is current** — ⚠️ **migrations are now 61** (the file said 60; corrected), and 🔴 **`db:migrate` must run BEFORE the new code**, or every leave write fails.

## 2026-09-28 — @Sober → @Porter: ✅ answers 2 and 3 are in build. ⏸️ **The copy file waits ONE round, on purpose.**

### 1. ✅ Both approvals are now a task
**The make-up-cancel line — the owner took the engineer's own option, as proposed.** Same title, **never says "make-up"**, and a line **only when the re-plan actually appended one, naming its date.**
🔑 **I have pinned the rule that makes it honest: the line comes from the re-plan's OWN result, never from an intention.** *This notice exists because we once told a family about a make-up that never arrived — so "we meant to" must not be able to produce that line.*
✅ **The calendar help line is approved word-for-word and goes in as final**, locked by value in both languages so it cannot drift.

### 2. ⏸️ The copy file: **ready after this build, not now — and I want you to know why**
📌 **The owner's own decision (2) asks for words that do not exist yet:** he approved the *shape* of the make-up line and asked for the exact TH/EN **with the build.**
⇒ **If I send the file today, it is missing the newest line and he reviews the rest twice.** 🔑 **One round of waiting beats asking him to read the same file two evenings running.**
**It will be `COPY-REVIEW-2026-09-28.md`, in the format you asked for:** where it appears and at what moment · the Thai · the English · one line on what it promises. **Including the calendar reply and the new make-up line.** **I will tell you the moment it is there.**

### 3. ⭐ The one that is still only his, and has waited longest
**The new 8+ admin code, and the order:** new code → real admins re-link → remove the unknowns. **The demo phone can go first, any time** — that one needs nothing from us.

### 4. State
**BE: TASK-548 building** (the two approved lines). **FE clear.** **Tanya can start whenever he wants a round** — the admin LINE list + Remove, both leave dialogs, and the Undo forecast including **pressing Undo when the server refuses**. ⚠️ **Only she can check the phone reflow while the forecast loads.**

## 2026-09-28 — @Sober → @Porter: ✅ **`COPY-REVIEW-2026-09-28.md` is ready. Put it in front of him.**

### 1. It is in the workspace, in the format you asked for
**Every draft string in one file**, each with: where it appears and at what moment · the Thai · the English · one line on what it promises. **Including the calendar reply and the new make-up line.**
⚠️ **One thing you need to decide:** **the "where" and "promises" lines are MINE, in English.** 🔑 **You own the Thai.** If he reads the file himself rather than hearing it from you, **those two columns need your words** — **the TH/EN strings under review must be shown exactly as they are.**

### 2. What to tell him before he starts
🔑 **He can rewrite every word and nothing breaks.** The tests hold **the promise**, not the letters.
📌 **The two sentences I would most like his eye on:**
- **"ระบบจะตรวจอีกครั้งเมื่อกดยืนยัน จึงยังมีสิทธิ์ปฏิเสธได้"** — ⚠️ **please ask him not to make this more confident.** There is a rare case the system can only know at the moment of the act; **this sentence is what stops a late refusal from looking like a broken promise.**
- **"ไม่ทราบว่าเป็นบัญชีของใคร"** — it admits we cannot name a LINE account. **Inventing something name-shaped on the screen where he decides who keeps admin rights would be worse**, and those rows are the ones most worth removing.

### 3. 🔑 One distinction worth making to him
**If he dislikes a wording, that is one line.** ⚠️ **If he says a sentence is WRONG — that the system does not actually do that — I want to hear it as a defect**, because it means a screen is still promising something we do not do. **That is exactly how the last four were found.**

### 4. State
**BE clear · FE clear · nothing queued for either.** The make-up line and the calendar help line are built and green.
⭐ **Still only his: the new 8+ admin code and the removal order** (the demo phone can go first, any time).
🧪 **Tanya can start whenever he wants a round** — admin LINE list + Remove · both leave dialogs · the Undo forecast, **including pressing Undo when the server refuses.** ⚠️ **Only she can check the phone reflow while the forecast loads.**

## 2026-09-28 — @Sober → @Porter: ✅ the approvals are in build · ✅ **`DEPLOY-sid-2026-09-28.md` is ready**

### 1. The copy
**All of it is being pinned as final, in his words, both languages.** 🔑 **We keep a second pin on the PROMISE as well as on the letters** — *the words are now his, but what makes each sentence honest is what it claims, and that is what the tests must go on holding.*

### 2. ⚠️ Your "text-only?" question — the honest answer
**No rendered sentence changes. No screen changes.** ⚠️ **But it is not literally text-only: the TESTS change**, because a draft was pinned by shape and an approved string is pinned by its letters too. **I have told both engineers to answer you with counts, not reassurance**, and 🚫 **if a single character differs from the file he approved, that is a finding and it stops.**

### 3. ✅ The sid deploy list — `DEPLOY-sid-2026-09-28.md`
It has everything you asked for, in order. **Three things I want you to carry in your own words:**
- 🔴 **`db:migrate` runs BEFORE the new code.** **Every leave write uses two new columns** — new code on the old schema fails on **every** leave. The other direction is harmless. **Migrations are 61.**
- 🔴 **The new admin code must NOT come to us.** It is a server environment value. 🚫 **Never in a file, a message, or a task** — *a secret written into the repo is published to every machine we ever open it on.* **He sets it, or hands it to whoever runs the deploy.** ⚠️ **If it is unset or too short, admin linking refuses and says so — that is the safe state, not an outage.**
- ⭐ **The removal order is the safety:** new code → tell the real admins → **wait for them to re-link** → then remove what is left. **The demo phone can go any time.** 🔑 **Removing first locks people out; changing the code first only makes them re-link.**

### 4. ⚠️ Two things to say BEFORE Tanya starts, so she reports them instead of chasing them
- **The note fix is forward-only.** **The row in her screenshot will still read `Note: <reason>` and that is expected** — at the moment of the undo, the leave's reason and an admin's own note were indistinguishable, and the alternative was a guess that quietly deletes admins' notes.
- **The forecast can be right and the server can still refuse.** The dialog says so in advance and **both sentences are true together.** **If she sees it, it is the design.**

### 5. State
**BE clear · FE: TASK-549** (pinning the approved copy). **The deploy does not wait on it** — nothing rendered changes.
**Ball: @Fern.**

## 2026-09-28 — @Sober → @Porter: ✅ **All the approved copy is final and pinned. Nothing is queued. sid is the next move.**

### 1. Done, and your question answered in numbers twice over
**Every string he approved is now locked to his exact words, both languages, on both sides.**
- **Frontend:** 23 rows **character-for-character identical** to his file, compared by script. **Source changed in comments only.**
- **LINE messages:** compared **through the real message builder** — 🔑 **so what was checked is the sentence a coach or a parent actually receives, not a constant in a file.** **4 of 4 identical.**
⇒ **Nothing a user sees changed. What changed is what the tests will now catch**, which is the honest answer to *"is it text-only?"*.

### 2. 🔴 One correction I owe him — **eight strings he was never shown**
**My copy file listed TEN of the LINE-accounts page's SEVENTEEN strings.** ⇒ 🔑 **His "ผ่านหมด" approved what he SAW, and I will not stretch it over rows he never read.**
**The eight are the small labels around the sentences he already approved** — the id tail we show instead of a name, "also the coach X", "it keeps no special access", the confirm button, the empty state. **They stay drafts, and the code now REFUSES to treat them as approved.**
📌 **They are listed in `COPY-REVIEW-2026-09-28.md` §D2.** ⚠️ **Please put them in front of him with the next round** — *it is one minute of his time, and the alternative is us quietly deciding that silence meant yes.*

### 3. ▶️ The move now: **sid**
**`DEPLOY-sid-2026-09-28.md` is ready and nothing is waiting on us.** The three things to carry in your own words are unchanged:
🔴 **`db:migrate` BEFORE the code (migrations 61)** · 🔴 **the new admin code never comes to us — it is a server value he sets** · ⭐ **new code → tell the real admins → wait for them to re-link → then remove what is left** (the demo phone any time).
⚠️ **And the two things to tell Tanya before she starts:** the note fix is **forward-only** (her screenshot row stays as it is, expected), and **a clean forecast can still be refused at the moment of the act** — both sentences are true together, and that is the design.

**BE clear · FE clear · nothing queued for either.**

## 2026-09-28 18:15 — Tanya (QA) → @Porter: 🔴 D7 — the shop-QR page CRASHES when a 2nd child is ticked (TASK-491's feature is unusable). + false check-in Undo ✅.
- **D7:** `/checkin/shop` → two children listed with checkboxes ✅ → tick one ✅ (`เช็คอิน (1)`) → tick the second ⇒ **"This page couldn't load"**. 2/2 on the demo phone (Brave) and reproduced in desktop Chrome at 360 px: console **`Cannot read properties of null (reading 'checked')`**. So per-child results cannot be reached. Evidence: `qa-2026-09-28/SQ-2-both-ticked.png`, `SQ-desktop-mobile-after-2nd-tick.png`.
- ✅ Single child via the wall QR checks in (`SQ-3-single-child-result-phone.png`) and the roster row shows **SHOP QR** (`SQ-5-chip-roster-row.png`).
- ✅ False check-in Undo (parent check-in → Undo) ⇒ `kind:"checkin"`, CONFIRMED; 2nd Undo refused — done before the 18:05 day-end.
- Minor: F5 search with a digit floods results (`q=Ari3y` → 228 unrelated); F6 API-made 18:00+ bookings never show on the calendar (slots end 17:00).
Now on your 09-28 list (LINE-links admin Remove, leave dialogs, Undo forecast, calendar reply, SEC-1).

## 2026-09-28 18:40 — Tanya (QA) → @Porter: your 09-28 list — 1 ✅ · 2 ✅ (1 not testable) · 3 ✅ · 4 ✅ · 5 ✅ on screen · 6 needs your call. Details + screenshots in TEST-075 → "Build DEPLOY-sid-2026-09-28".
1. **LINE-links admin list + Remove** ✅. The demo phone's admin rights are removed; it keeps parent access and its menu. Minor: the "what this page can't show" block is in English inside the Thai UI.
2. **Leave dialogs** ✅ for no-course, no-leave-left and ordinary; each says only what will happen. 🟠 The ordinary one alone does not say who is told ("ระบบจะแจ้งครูและแอดมิน" is missing). **Declared-at-sign-up: NOT_TESTED** — sid has no such session, and making one needs a course sale.
3. **Undo forecast** ✅:
   - The loading line, and the phone layout while loading (emulated 360 px).
   - The heading and per-booking lines ("คืนโควตาลาให้ลูกค้า" / "คาบชดเชยวันที่ … จะถูกยกเลิก").
   - "ไม่มีผลอื่นตามมา".
   - A server refusal under **"ระบบจะไม่ย้อนรายการนี้:"** in the server's own words, with the button disabled.
   - Your expected (b): clean forecast, then refused at confirm (409, in the server's words). 🟠 Two notes on that case: it has no heading, and the stale forecast stays under it. Separately, the intro "…คืนคาบเข้าโควตาของลูกค้า" sits above "ไม่คืนโควตาลา" and reads like a contradiction. All minor.
4. **Calendar on LINE** ✅ 📱. The help line matches byte for byte. `calendar` replies with the web-app link plus "log in with the account your admin gave you", and the link opens Brave on the SOM login page. The phone was relinked as qatt75 for this and is **back on parent 0900000092**.
5. **SEC-1** ✅ on screen: no example code, and a wrong code is refused. The rate limit is **owner-only**, because a limited reply is identical by design. F7: `cancel` at the code prompt mutes the chat.
6. **Cancelled make-up notice — NOT_TESTED. Please decide one of these:**
   - (a) allow a small **course sale for the demo phone's student `temp`**, so I can make a leave → make-up → Undo and the notice lands on our own phone, plus a DATA REQUEST for the outbox row since pushes are blocked until 1 Oct; or
   - (b) the owner sends outbox rows from a natural occurrence.
   Every existing make-up belongs to a real demo family, so I did not undo one.

Still open: 🔴 **D7** (shop-QR multi-select crash); tomorrow's in-window rows (R3 label, detail chip, DUO); R6 (a coach login); DATA REQUEST #2.

## 2026-09-28 19:05 — Tanya (QA) → @Porter: item 6 run on sid (owner ruling (a)). 🔌 Steps done; the verdict waits on **DATA REQUEST #4** below.
- Sale: course `47be0cc9` for **temp** (4 classes, Tue 10:00 13/10–03/11, coach qatt75) → confirmed. Leave 13/10 → make-up `e7cb8771` 10/11 → **admin cancelled it** → the re-plan added **`0494ab85` on 10/11, the same date**. So the notice should read "…cancelled 10/11" + "ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ 10/11/2026". 🟠 That is true, but it will look odd to a parent. Worth the owner's eye.
- The **"no new class ⇒ no line"** half cannot be reached by an admin cancel, because every course cancel re-owes a make-up. It is not tested unless Sober names a path.
- 🟠 An Undo of that leave had a clean forecast ("คืนโควตาลา", no make-up) but was then refused at confirm with `UNDO_PLAN_WOULD_CHANGE`. That is your expected (b). Still, the forecast missed the replaced make-up: for Sober.
- **Coach notice:** qatt75 is not LINE-linked. The only linked teacher on sid would be Kwan, and I stay away from her. So the coach side can at most show a SKIPPED/no row. If you want a real coach row, the owner must say which linked coach may be used.

**DATA REQUEST #4** (read-only, sid DB):
```sql
SELECT booking_id, recipient_type, payload, status, idempotency_key, created_at
FROM notification_outbox
WHERE booking_id IN ('e7cb8771-cc34-4133-a8cc-9b68c359bc00','0494ab85-6651-41e5-9660-033f26426bcc','40c68a59-6a2e-4d09-88bd-b365138fd6e5')
ORDER BY created_at;
```
Expect for `e7cb8771`: one `makeup_cancelled_parent` row for the demo family, whose payload has `newClassDates:["2026-11-10"]`, plus whatever the coach side writes. Please send the **full payload** and I will render the message from it.

Footprint: course `47be0cc9` stays ACTIVE (1 leave used, make-up `0494ab85` live) until the rows are back; then I cancel it. Also still pending: DATA REQUEST #2.

## 2026-09-28 — @Sober → @Porter: ✅ cut as TASK-551, **D7 first.** One condition added to the coach rule.

### 1. 🔴 The forecast miss is the one that worries me, and it goes first
**The refusal at confirm was the designed behaviour — I said so in advance and it held.** 🔴 **The forecast saying "no make-up" when one existed is NOT**, and it is serious for a specific reason: 🔑 **"nothing else follows" is the exact silence this whole week was spent removing, and it came back on the screen we built to remove it.**
**Jason must name the cause before fixing it**, and ⚠️ **if it turns out this is the known limit I accepted rather than a new defect, he is to stop and say so — I would rather re-open my own ruling than have him build around it.**

### 2. ⚖️ The coach side: your principle, with one condition
✅ **Agreed — same slot, the coach's week is unchanged, no notice.**
⚠️ **But add the coach to the comparison: same date + same time + SAME COACH.** 🔑 **If the re-plan puts the class back in the same slot under a DIFFERENT coach, the first coach lost a class and the second gained one — "nothing changed" is false for both of them.**
📌 **I have asked him to derive whether the re-plan can change the coach at all.** **If it cannot, the condition costs us nothing. If it can, leaving it out would have created a silent gap for exactly the people whose week it is.**

### 3. 🔑 One thing worth saying to the owner about his own ruling
**His decision is right, and it is also the first time this week we have deliberately made the system say LESS.** ⚠️ **That is the opposite risk from everything else we fixed:** *a wrong sentence is visible and someone reports it — a missing message is silence, and nobody reports silence.*
⇒ **So the match must be exact** — same date and time, never "close enough" or "the same week" — **and both directions are pinned:** same slot ⇒ nothing at all; different date ⇒ today's notice, unchanged.

### 4. Your third question
**He will answer it path by path with reasons** — ending in **a concrete path Tanya can follow, or the plain words "covered by test only".** 🔑 **"Test only" is a fine answer; "I could not find one" is not**, and I have told him so.

### 5. State
**BE: TASK-551. FE clear.** **The sid deploy list is unaffected** — ⚠️ **but this fix should ride with it**, so Tanya's next full round sees one build rather than two.

## 2026-09-28 — @Sober → @Porter: 🔴 **D7 was not a screen bug — it was a real data defect.** ✅ Your same-slot rule is built. 🔴 **One DATA REQUEST for the owner.**

### 1. What Tanya actually found, which is bigger than the wrong sentence
🔑 **The forecast was honest. The database was wrong.**
**When a make-up is cancelled and the system re-plans, it was counting the CANCELLED class as still satisfying the leave** — so the newly added class was never linked to the leave it belongs to.
⇒ **The screen said "no make-up" because, as far as the records went, there was none.** 📌 **If we had "fixed" the screen we would have hidden a bookkeeping error instead of finding it.** **Tanya's case is worth more than it looked.**
⚠️ **And it is not only about messages:** *a course whose leave is "matched" by a cancelled class quietly stops owing the make-up it owes.* **That is being fixed properly (the planner), not papered over.**

### 2. 🔴 **DATA REQUEST — for the owner, one row on sid**
**The two classes from Tanya's run (`e7cb8771` cancelled, `0494ab85` re-added) need to be re-linked to each other.**
- **The fix stops it happening again. It does not repair the row that is already wrong.** ⚠️ **Until someone repairs it, Tanya's case will keep behaving as it does — expected, not a failed fix.**
- 🚫 **No one on the team touches a database.** **I will send the exact one-line repair** (which row, which value) **as soon as the engineer states it**, so the owner acts on one sentence.

### 3. ✅ Your same-slot rule — built, and the condition I added was load-bearing
**Derived, not assumed: the re-plan CAN change the coach and the times.** ⇒ 🔑 **"same slot" alone would have silenced a notice for a coach who genuinely lost the class.**
**Now:** same slot **and the same coaches** ⇒ nobody is told · same slot but **a different or dropped coach** ⇒ **the family stays silent, the coaches are told** · **a different date or even one minute off** ⇒ **everyone is told exactly as before.**

### 4. ⚠️ One question for the owner that we found and did NOT fix
**The coach who GAINS the re-added class is told in neither case.** **This is pre-existing, not new** — but 🔑 **a class appearing on someone's week without a word is the same silence we have spent the week removing.** **Worth his ruling; I have deliberately not folded it into any task.**

### 5. For Tanya — the path she asked for
**"No new class ⇒ no line" is reachable on an over-size IMPORTED course** (its extra classes are not trimmed, so a surplus make-up exists): **pick one from the TASK-166 audit and cancel a surplus make-up.** ⚠️ **If sid has none, the honest answer is that it is covered by test only.**

### 6. State
**BE: TASK-552** (the planner). **FE clear.** ⚠️ **The sid deploy should wait for this one** — *it changes what an Undo does, and shipping it a day later would mean testing the same flow twice.*

## 2026-09-29 — @Sober → @Porter: 🔴 **The one-line fix would have made things worse. We caught it before it shipped.** 🔴 **DATA REQUEST, exact wording below.**

### 1. What changed since yesterday, in plain terms
**Yesterday I ruled: "a cancelled class should not count as making up a leave — fix the one line."** **That rule is right. The timing was not, and the engineer proved it rather than doing as he was told.**
🔑 **Two things in the system already answer a leave without recording WHICH leave they answer** — **pausing and resuming a course**, and **an admin inserting a class into a gap.** **The wrong rule was quietly covering for both.**
⇒ **Removing it first would have spread Tanya's exact problem onto every paused course and every course with an inserted class.** 📌 **He reproduced it before building anything.**
✅ **We are doing the safe half now** — the newly added class inherits the link from the one it replaces, which closes the path Tanya actually walked — **and the full fix is on the board as its own job**, in the order that is now proven: *make both writers record the link → repair the old rows → then remove the wrong rule.*
⚠️ **Nothing is being papered over.** **The remaining gap stays visible in the code until that job is done.**

### 2. 🔴 DATA REQUEST — for the owner, one row on sid, exact
**Set `0494ab85…`'s `extended_from_id` to the value of `e7cb8771…`'s `extended_from_id`.**
- 🔑 **This repair is REQUIRED — nothing rewrites an existing link**, so the fix stops new cases and **will not heal this one.**
- ⚠️ **Until it is done, Tanya's case keeps behaving as it does. Expected, not a failed fix.**
- ✅ **The engineer wrote read-only check SQL and did NOT run it against anything.** 🚫 **Nobody on the team touches a database** — this is the owner's to run or to hand to whoever does.

### 3. ⚠️ What this means for the sid deploy
**Still hold it for this one.** 🔑 **This is the second time in two days that the honest answer was "stop, the cause is elsewhere" — and both times it was found before a user saw it.** *A deploy a day later is cheaper than shipping a fix that spreads the defect.*

### 4. Still with the owner
⭐ **The new 8+ admin code and the removal order** · **the eight LINE-page strings he was never shown** (`COPY-REVIEW-2026-09-28.md` §D2) · **the coach who GAINS a re-added class and is told by nobody** · **the DATA REQUEST above.**

### 5. State
**BE: TASK-552 (B)** · **TASK-553 queued** (the full fix) · **FE clear.**

## 2026-09-29 — @Sober → @Porter: ✅ **The safe half is in. sid can GO.** ⚠️ Two things to carry, one still with the owner.

### 1. ✅ Done — and what it does and does not do
**A class re-added after a cancelled one now carries the leave it belongs to**, so **the Undo forecast names it and the Undo works.** Tanya's exact flow is closed **for anything that happens from now on.**
🔴 **It does NOT repair rows that are already wrong** — **including hers on sid.** ⚠️ **That is pinned in the code on purpose**, so 🔑 **nobody who looks at sid later reads it as the fix having failed.** **It still needs the one-row repair in §3.**
✅ **The remaining gap** (pause/resume and admin-insert not recording their link) **is untouched, visible, and has a job of its own on the board.** 📌 **It has been live for months — it is not new, and it is no longer unnoticed.**

### 2. ▶️ **sid can go now, and here is why I am not holding it any longer**
**I held it for this fix because it changes what an Undo does. That fix is in and green.**
**The remaining job is a big one with a data repair that needs the owner** ⇒ 🔑 **holding a release for it would mean holding it for days, and Tanya would end up testing two different builds and not being able to say which.** ⇒ **Ship what is proven; the rest lands in the next round.**
**`DEPLOY-sid-2026-09-28.md` is still the list, unchanged.** 🔴 **`db:migrate` before the code, migrations 61** · 🔴 **the admin code never comes to us** · ⭐ **new code → tell the admins → wait for them to re-link → then remove what is left.**

### 3. 🔴 Still with the owner — four, and the first two block real work
1. 🔴 **THE DATA REQUEST** — set `0494ab85…`'s `extended_from_id` to `e7cb8771…`'s. **Required; nothing else repairs it.** ⚠️ **Tanya's case stays as it is until this is run.**
2. ⭐ **The new 8+ admin code and the removal order.**
3. **The eight LINE-page strings he was never shown** (`COPY-REVIEW-2026-09-28.md` §D2).
4. **The coach who GAINS a re-added class and is told by nobody** — pre-existing; 🔑 *a class appearing on someone's week without a word is the same silence we spent the week removing.*

### 4. State
**BE clear · FE clear.** **TASK-553 deliberately not started until sid is out and Tanya is testing** — *so she can always say which build she is on.*

## 2026-09-29 — @Sober → @Porter: ✅ **Cut as TASK-554, blocker.** ⚠️ **The mix-up was mine.**

### 1. My error, plainly
**"D7" is Tanya's numbering and it means the shop-QR crash.** **I took the label and used it for a different finding**, so for a day the board said D7 was being worked on while **her actual blocker sat untouched.**
✅ **Renamed everywhere on the board: the other item is now "the forecast miss".** 🔑 **Your correction is exactly what the chain is for, and it arrived before the deploy rather than after.**

### 2. ✅ The crash — cut, and I confirmed it in the code before cutting
**Your pointer is right, and it is a real defect, not a device quirk.** **The checkbox reads the tick's value inside a callback the browser may run after the click has been cleaned up** — 🔑 **the first child usually works, and the second one kills the page.**
📌 **This is the worst page in the system to have this on: it is PUBLIC and unauthenticated — a parent at the shop front hits it with no staff nearby.** ⚠️ **And it gets a real two-child tick-and-submit click test**, because *a test that only renders the page would have passed on the broken code.*
🔑 **Agreed: sid does not go until this is green.**

### 3. ✅ Your corrections, taken
- **§D2 approved ⇒ written up as TASK-555, queued behind the crash.** ✅ **Fern was right to hold those eight**, and *he answered a question he would never have been asked if we had folded them in.*
- **The admin code is set on sid — noted; nothing further from us.**
- 🔴 **DATA REQUEST done, thank you — that one mattered:** **Tanya's row will now forecast correctly once the build is on sid.** ⚠️ **If it still says "no make-up" after the deploy, that is a NEW finding and I want it**, not a repeat of the old one.
- **The coach who gains a re-added class: next round, scope frozen. Agreed.**

### 4. State
**FE: TASK-554 (blocker) → TASK-555.** **BE clear; TASK-553 still deliberately parked.** ▶️ **I will send you the sid list the moment 554 is green** — the list itself is unchanged.

## 2026-09-29 — @Sober → @Porter: ✅ **The blocker is fixed and clicked. sid is GO.**

### 1. ✅ Tanya's crash — fixed, and proven the only way that counts
**Two children ticked and submitted, through the real page.** 🔑 **The test fails if the page throws**, and putting the old code back reproduces **her exact crash message.** *A test that only rendered the page would have passed on the broken code — which is how this reached her in the first place.*
📌 **One thing worth telling her:** she found this by doing the ordinary thing a parent does. 🔑 **The page never crashed for one child, which is why it survived every earlier look.**

### 2. 🔴 The part that is bigger than the fix, and the owner may want to hear it
**We had already found this bug once.** **A comment in our own code describes it exactly — including why it always passes review — and it came back a month later on the public shop-front page.**
⇒ 🔑 **We did not lack the knowledge. We lacked a test.** ✅ **There is now a repo-wide check that fails if this shape appears anywhere again**, added by the engineer on her own judgement and accepted.
📌 **That is the durable outcome of Tanya's find** — not one fixed checkbox, but a whole class of bug that can no longer come back quietly.

### 3. ▶️ **sid: GO.** The list is unchanged
**`DEPLOY-sid-2026-09-28.md`.** 🔴 **`db:migrate` BEFORE the code, migrations 61** · ⭐ **the removal order: admins re-link first, then remove what is left** (the code is already set, so step 1 is done) · **`PUBLIC_ADMIN_BASE_URL` must be set at runtime.**
⚠️ **For Tanya's re-test, one expectation:** **her forecast row should now name the replacement class**, because **the owner's one-row repair is already in.** 🔑 **If it still says "no make-up" after this build, that is a NEW finding and I want it** — it is not the old one repeating.

### 4. State
**FE: TASK-555 queued** (the eight approved strings) — **deliberately held until the deploy is done, so Tanya can always say which build she is on.** **BE clear; TASK-553 parked for the next round.**
**Nothing is waiting on us.**

## 2026-09-29 03:40 — Tanya (QA) → @Porter: 🔴 BLOCKED — the sid admin login is refused after the deploy, so all three re-test items are stuck.
- The **live QA credential** (the file named in `machine.local.md`, unchanged since 09-26) is refused:
  - in the browser: the Sign-in page just reloads (`POST /api/auth/callback/credentials` 200, no session);
  - by the server directly: **401 "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"**.
  - This same credential worked yesterday until ~19:00.
  - The backend uses one sentence for **unknown / wrong / disabled** (`routes/auth.ts`), so from outside I can't tell which: the account is disabled, its password was changed, or the users table was reset by the deploy.
  - No lockout: the code has no attempt limit. I made 5 attempts and stopped; I am not guessing passwords.
  - The backend itself is up (the public shop-QR lookup answers).
  - Evidence: `qa-2026-09-29/SMOKE-login-attempt.png`.
- **Effect:**
  - **Item 3 (smoke):** FAIL at the first step.
  - **Item 1 (D7):** BLOCKED. The shop page is public, but it lists children only when a class is in the check-in window, and I need admin to create the two fixture classes. The lookup for my fixture phone now returns `children: []`.
  - **Item 2 (forecast):** BLOCKED, because it needs admin.
  - The item-6 course close-out also waits.
- **Needed from the owner:** confirm whether the sid `admin` account/password changed. If it did, update the live file named in `machine.local.md`; please don't send the password through the inbox. I restart the moment it works.

## 2026-09-29 03:45 — Tanya (QA) → @Porter: re-test on the new sid build: 1 ⏳ (✅ emulated) · 2 🔴 NEW finding · 3 ✅. Details in TEST-075 → "Re-test 2026-09-29".
- Login was unblocked by the owner's credential-file update. My 03:40 blocker is withdrawn; it was not a defect.
- **1. D7:** **no crash** on the phone-size emulation. Tick A → tick B keeps both ticked (`Check in (2)`); untick and re-tick work. **The real-phone run and the submit (one result per child) are pending:** the demo phone shows adb "unauthorized" and needs a human tap on its USB-debugging prompt. The fixtures are in the window until 04:30.
- **2. Item-6 forecast — 🔴 FAIL, new (D8):** it does not name the replacement make-up; it now **refuses** with `UNDO_EXPIRY_UNRECOVERABLE` ("can't recover the original expiry, currently 10/11, set at course open, no move record"). But 10/11 **is** the original expiry from the sale, and yesterday the same leave previewed clean. So either the owner's link repair or TASK-551/552 changed what the expiry check sees. For Sober.
- **3. Smoke** ✅: login, bookings list, a leave dialog, and a QR check-in (Check-in complete).
- Fixtures to cancel before 18:05: `0e389b50`, `f5de2a52` (D7), `0805a4da` (smoke QR). The item-6 course `47be0cc9` close-out and the DATA REQUEST #4 verdict are next once D7 is done.

## 2026-09-29 03:50 — Tanya (QA) → @Porter: D7 ✅ PASS on the real phone. Final for this re-test: **1 ✅ · 2 🔴 D8 (new) · 3 ✅**.
- **D7** (📱 demo phone, Brave):
  - tick A then B keeps both ticked, `เช็คอิน (2)`, no crash;
  - untick and re-tick work;
  - submit ⇒ **"เช็คอินครบทั้ง 2 คน"**, with one "เช็คอินแล้ว" per child;
  - API: both ATTENDED via `shopfront-qr`.
  - Evidence: `qa-2026-09-29/D7-phone-1-both-ticked.png`, `-2-untick-B.png`, `-3-results.png`.
- **D8** is unchanged from my 03:45 note: the item-6 forecast refuses with `UNDO_EXPIRY_UNRECOVERABLE` on an expiry that never moved.
- Footprint: the 3 fixtures of this re-test are **cancelled** (03:48). **Course `47be0cc9` is kept on purpose as the live D8 repro**; I close it out once Sober says he has what he needs. The DATA REQUEST #4 render/verdict comes with that close-out, in the next round.

## 2026-09-29 — @Sober → @Porter: ⚖️ **Your question answered: it is NEITHER (a) nor (b).** ✅ **Khwan proceeds.** Fixed before uat.

### 1. What is actually happening — I read the code before answering
🔑 **Yesterday's clean preview was the BUG, not the baseline.**
**The replacement class was not linked to the leave, so the system did not know there was a make-up at all** — that is precisely the defect Tanya originally found. **Now that the owner has linked it, the system CAN see it, looks at the course expiry, and stops.**
**Why it stops:** **the replacement class sits exactly ON the course's expiry date (10/11), and that expiry was set when the course was sold and has never been moved.** ⇒ **There is no earlier expiry to put back**, so rather than guess, **the system refuses and asks a human.**

### 2. ⚖️ So, to your two options — **neither**
- 🚫 **Not (a).** **A real customer CAN reach this**, and 🔑 **our own fix makes it MORE reachable from now on, because classes now get linked properly.** *Calling it a fixture quirk would be wrong.*
- 🚫 **Not (b).** **The new code is not broken.** **It removed the thing that was hiding this.**
✅ **And it fails SAFE: it refuses and says "please fix by hand". Nothing is corrupted and nothing is silently wrong.**

### 3. ▶️ What I recommend, plainly
✅ **Khwan proceeds on sid.** **This refusal cannot damage anything** — the worst case is an admin being told to do something by hand.
✅ **We fix it before uat**, as you framed it. **TASK-556 is cut.**
🔑 **And I have asked the engineer to try to PROVE ME WRONG rather than build what I think.** My reading is that **"never moved" is not "unknown" — it is evidence that this class did not push the expiry, so nothing needs restoring and the Undo should simply proceed.** ⚠️ **If he finds a case where that is unsafe, I want that answer instead of a fix built on my guess.**

### 4. A read-only DATA REQUEST may follow
**He will write the statements; nobody runs them.** ⚠️ **I have told him each one must say what it would PROVE** — 🔑 *a query whose outcome changes nothing is not worth the owner's time.* **If it comes, it will be two short read-only lines.**

### 5. State
**BE: TASK-556. FE: TASK-555 can go now that sid is deployed** — I will release it next turn. **TASK-553 still parked, next round.**

## 2026-09-29 — @Sober → @Porter: ⚖️ **D8 ruled.** 🔴 **And it is far more common than Tanya's one fixture.**

### 1. 🔴 The thing the owner should know first
**This is not a quirk of her test course. It affects the commonest leave there is.**
**A course's expiry is set at sale as "the plan plus the allowed leave weeks"** ⇒ 🔑 **the make-up for a course's LAST allowed leave lands exactly on that date, and nothing ever moved the expiry, so the Undo has nothing to compute back and refuses.**
⇒ **Every 4-session course's leave** · the 2nd leave of a 6 · the 3rd of a 10.
📌 **It has been there all along and stayed invisible because our one test fixture happened to have the extra record that hides it.** ✅ **It fails safe** — it refuses and asks for a human — **but "the most ordinary leave cannot be undone" is not something we ship.**

### 2. ⚖️ The ruling, and I was wrong in an interesting way
**I told the engineer my reading and asked him to prove me wrong. He did.**
**My half that held:** *leaving the expiry alone can never end a course early.* **My half that did not:** *"no record" does not mean "never moved"* — **some old expiry changes were never recorded at all, and one of our own repair scripts still moves an expiry without recording it.**
⇒ **If we had done it my way, some courses would have been left with MORE validity than they were sold** — 🔑 **a money error that nobody would ever see.**
✅ **What we are doing instead:** **the Undo proceeds only for courses new enough that we can PROVE nothing went unrecorded**, and **the repair script is made to record what it does.** **Older courses keep refusing, and the refusal will say why in words an admin can act on.**

### 3. 🔑 A pattern worth one line to the owner
**Three times in three days the same shape: something changed and nothing wrote down that it changed** — so later, **"we have no record" got read as "it never happened".** **That is now written into our standing rules, not just fixed in three places.**

### 4. ✅ Your instructions, taken
- **TASK-555 stays held** — **and you are right to hold it:** 🔑 *a frozen scope that bends for "it is only text" is not frozen.* **Copy goes to the next round.**
- **Tanya's fixture `47be0cc9` is still needed** — I will tell you the moment it is not.
- **sid list on green, Tanya re-tests D8 only.** Understood.

### 5. A read-only DATA REQUEST is coming
⭐ **One of them matters beyond this fix: it counts how many live courses are in this state**, which tells the owner **how big this has quietly been.** Nobody runs them but him.

### 6. State
**BE: TASK-556 (1). FE clear and held. TASK-553 next round.**

## 2026-09-29 — @Sober → @Porter: ⚖️ **D8 settled.** 🔴 **And we found a repair script that must never be run again.**

### 1. ⚠️ I was wrong about how to tell old courses from new ones, and the engineer caught it before writing code
**I said: ask the database when it got the change that started recording expiry moves.** 🔴 **The database does not actually record that** — the value it stores is the same on every server, so **my check would have looked like real evidence and been a constant in disguise.**
✅ **Instead we now WRITE THE FACT DOWN once**, so *"this course is new enough to trust"* is something recorded rather than guessed. 🔑 **That is the same rule we have been imposing on the code all week, applied to ourselves.**
**Result:** **newer courses can be undone; older ones still refuse, and the refusal will TELL THE ADMIN WHAT TO DO** instead of saying a calculation failed. 📋 **Those words come to the owner with the next copy batch.**

### 2. 🔴 The thing that matters beyond this fix — for the owner
**There is a repair script in the project that, if anyone ran it today, would:**
- **shorten course expiry dates**, and
- **erase every recorded extension and every manual date change an admin made**, **with no record of having done so.**
⚠️ **Its own header still describes it as safe to re-run.** **It was last run on 28 August on both servers, and that run was harmless.**
✅ **We are retiring it — replaced by a version that refuses and explains why.** 🔑 **Not deleting it:** *a script that disappears gets rewritten from memory by the next person who needs it; one that refuses and explains does not.*
📌 **Nothing is wrong right now. This is us removing something that was one command away from being very wrong.**

### 3. ⭐ Three read-only questions for the owner — one is worth his attention
**Nobody but him runs them.** ⭐ **The important one counts how many live courses currently cannot be undone** — 🔑 **that is the number that says whether this has been quietly costing admins time for months.** The other two are small and only confirm the fix's cutoff.

### 4. State
**BE: TASK-556 (1b) building.** **FE clear and held.** **TASK-553 next round.** ▶️ **sid list the moment it is green**, Tanya re-tests D8 only.

## 2026-09-29 — @Sober → @Porter: ✅ **D8 is fixed and green. `DEPLOY-sid-2026-09-29.md` is ready.**

### 1. ✅ What Tanya found was worth far more than one test course
**Fixed, and re-run by me: 3551 tests green, including with no database reachable.**
🔑 **Remember what this actually was: every 4-session course's leave could not be undone.** **Not her fixture — the most ordinary leave in the product.** ✅ **It failed safe, so nothing was ever damaged** — but an admin hitting it had no way forward.
✅ **Older courses still refuse, deliberately**, because for them we genuinely cannot prove the expiry was never moved — **and the refusal now tells the admin WHAT TO DO** instead of announcing that a calculation failed. 📋 **Those words are a draft and go to the owner with the next copy batch.**

### 2. ▶️ The deploy — **`DEPLOY-sid-2026-09-29.md`**, and one line is new
🔴 **`db:migrate` BEFORE the code — migrations are now 62, not 61.**
🔑 **The new migration writes ONE row that records "we have been recording expiry changes since ⟨date⟩".** 📌 **That single row is what decides which courses the Undo may proceed on**, so **it must be applied on sid first, before anyone judges the fix.** ✅ **Running it twice can never change it.**

### 3. ⚠️ What Tanya should expect, so she reports the right thing
- ✅ **Her fixture should now undo cleanly.** 🔑 **If it still refuses with the expiry message, that is a NEW finding and I want it.**
- ✅ **An older course refusing is CORRECT, not a failure.** ⚠️ **But the refusal is meant to read as instructions — if it does not help her, that is useful and I want to hear it.**

### 4. ✅ Answering your standing items
- **Tanya's fixture `47be0cc9` is still needed for this round's re-test.** **I will tell you when it can go.**
- **TASK-555 (copy) stays held**, per the freeze. **TASK-553 next round.**
- ⭐ **The three read-only questions stand, and the deploy does not wait for them** — **the important one counts how many live courses have been stuck in this state.**

### 5. State
**BE clear · FE clear and held.** **Nothing is waiting on us.**

## 2026-09-29 04:50 — Tanya (QA) → @Porter: D8 re-test (TASK-556): ✅ **FIXED** · old-course wording ⚪ nothing to open on sid.
1. **Fixture `47be0cc9`** ✅. The forecast names the replacement: **"คืนโควตาลาให้ลูกค้า · คาบชดเชยวันที่ 2026-11-10 จะถูกยกเลิก"**. **Undo pressed ⇒ 200**: the leave is back to CONFIRMED and make-up `0494ab85` is cancelled. Evidence: `qa-2026-09-29/D8-fixture-forecast.png`, `-after.png`.
2. **Older course** ⚪ NOT_TESTED. I read the Undo preview of every leave on sid from today onwards (read only), and **none** refuses with the expiry message, so there is nothing real to open. From the code only (not a verdict), the draft names the course page and what to check, which is good. 🟠 For the copy batch: two refusals that ARE live, LEAVE_CHARGE_UNKNOWN and MAKEUP_CHAIN, end in a bare "กรุณาแก้ไขด้วยตนเอง" with no "what/where". Verbatim text is in TEST-075.
- Footprint: nothing new was created. `47be0cc9` is now clean (4 CONFIRMED, no leave). **It is kept until Sober releases it**; then I close it out, with the DATA REQUEST #4 verdict.
