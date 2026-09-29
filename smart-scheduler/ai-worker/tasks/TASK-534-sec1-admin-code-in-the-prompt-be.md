# TASK-534 — 🔴🔴 SEC-1: the bot TELLS a stranger the admin code, and the default IS that code — BE, S. **Ahead of everything.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size S.** Tanya, confirmed by @Porter. **Top of the queue, before every other task on the board.**

## §0 What it is — verified by me in the source
- `line-i18n.ts:215` — **`code_admin` reads *"กรุณาพิมพ์รหัสแอดมิน (เช่น 229) / Please type the admin code (e.g. 229)"*.**
- `line-webhook.service.ts:424` — **`const expected = process.env.LINE_ADMIN_VERIFY_CODE ?? "229";`**
- Porter checked all three env files **for presence only, without printing**: **each sets the value to exactly the number the prompt displays.**
⇒ 🔴 **Anyone who follows the OA can type `สมัคร` → `แอดมิน` → the number the bot has just shown them, and become an admin.** **No approval step.** They then receive **every family's leave notices and other admin notices — other people's children, by name, and their absences.**
🔑 **The prompt is not leaking a secret by accident: it is printing it as an example.** A stranger does not need to guess, search or intercept anything. **They need to read.**

## §1 Build — in this order, because the first two close the door
1. **Remove the example from BOTH prompt strings.** 🔑 **Pin it as a rule, not a string: no credential-ish value appears in any prompt** — the same shape as TASK-479's "no parent-facing string contains token", which is already a proven pattern here.
2. **No default. `?? "229"` goes.** If `LINE_ADMIN_VERIFY_CODE` is **unset, short, or equal to the old default**, **admin linking is refused** with a neutral line, **and the refusal is logged loudly.** 🔑 **Refuse the LINKING, not the boot** — ⚠️ **a boot refusal would take the whole product down over a config value, which is a worse outage than the hole it closes.** If you think boot-refusal is right, argue it; my ruling is: refuse the act, shout in the log.
3. **A minimum strength (8+).** State what you chose and why. 🚫 **Never echo the value, its length, or which check failed, to the chat** — the person typing may be the attacker.
4. **Rate-limit wrong attempts per LINE user**, reusing whatever the shop-front lookup already uses if it fits — **say whether it fits rather than building a second limiter.**

## §2 🔨 My ruling on your item 5 (super-admin approval): **yes, but NOT in this task**
**A shared secret typed into a chat cannot be revoked for one person** — and the owner has just ordered an admin-*unlink* control, which is the same need arriving from the other side. ⇒ **admin linking should require approval exactly as a teacher link does.**
🚫 **But not here.** This task's job is to **shut the door today**; approval is a flow with its own screens and words. **I am sending it up as the next security task**, and 📌 **you should design §1 so approval can be added without re-opening it** — say in your report whether anything you build would have to move.

## §3 📋 The DATA REQUEST — give Porter the SQL, run nothing
**List the admin LINE links on `uat` and on `sid`** — **display name and linked-at, no ids** — so the owner can see anyone who should not be there.
🔑 **And say plainly what the list can and cannot tell him:** it shows who **is** linked; it **cannot** show who linked *because of this hole* rather than legitimately. ⚠️ **If the two are indistinguishable in the data, say so** — the owner then decides whether to remove everyone and re-add, and that is his call, not a conclusion for us to imply.

## §4 What must not move
🚫 Teacher and parent linking · the no-oracle rule (a refusal must not tell a stranger whether the code was close) · the mute/hand-off rules · TASK-524's behaviours.

## Definition of Done
- [ ] No example in either prompt, **pinned as a rule over all prompts** · **no default**, and admin linking refused (neutral to the chat, loud in the log) when the value is unset / short / the old default · the strength rule chosen and argued · **nothing about the value, its length or the failing check ever reaching the chat** · a per-user rate limit (reusing the existing limiter, or a stated reason it does not fit) · **approval-readiness stated** (what would have to move) · 📋 the SQL for Porter **with its limits spelled out** · §4 pinned unchanged · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation restoring the example, one restoring the default, and one that tells the chat why the code was rejected · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-28): the door is shut in code. No example, no default, 8+ characters, one identical refusal, and a per-user miss limit the un-mute can't reset. **3458 / 0 normally AND unreachable, 0 failed queries** · tsc 0 · 60 = 60 · six mutations bite

## ⚠️ READ FIRST: what happens the moment this deploys
- Porter found **all three env files still hold the old value** (the one the prompt used to print).
- ⇒ **Once deployed, admin linking is REFUSED on every box until the owner sets a new code of 8+ characters.** The log will shout `🔴🔴 [SEC-1] admin linking REFUSED — LINE_ADMIN_VERIFY_CODE is retired`.
- **That is the door shut, as intended.** The owner then gives the new code to real admins **out of band** (never in LINE, never in a doc).
- 🚫 **Already-linked admins are NOT removed by this change**, including anyone who got in through the hole. They keep receiving notices until the owner acts on §5. **The code fix closes the door; it does not empty the room.**

## §1 (items 1–3) The gate: one pure module, `src/lib/line-admin-code.ts`
- **1. The prompt:** `code_admin` is now **"กรุณาพิมพ์รหัสแอดมิน" / "Please type the admin code"**. The example is gone.
  - 🔑 **Pinned as a RULE over every chat string** (a new read-only `allChatStrings()`: all 232 entries of the table + the registration copy): **no string that asks for a secret (รหัส · code · password · PIN · OTP) carries an example** (เช่น · e.g. · ตัวอย่าง · example).
  - A second rule: **the retired value appears in no chat string at all**.
  - Legitimate examples (a phone format, a birth date, a child's name) are untouched: they aren't secrets.
- **2. No default:** `?? "229"` is gone. The webhook reads the env **only through the gate**, and `229` no longer appears in the service (pinned).
  - **Unset / blank / shorter than 8 / a RETIRED value (`229`, even if someone sets it again) ⇒ admin linking refused**, and the log says which, loudly.
  - `.env.example` now has an **empty placeholder with the rule beside it** (the bootstrap-password precedent).
  - 🔑 **I agree with refusing the act, not the boot, and it's pinned:** importing the app with the code unset throws nothing.
- **3. Strength = 8 characters, and why:**
  - it's typed on a phone, so it must stay typeable;
  - with the miss limit, an all-digit 8-character code costs roughly 10^8 ÷ 5 ≈ 20 million hours to walk from one account;
  - it's **the same minimum the web bootstrap password already uses** (TASK-380), so the owner meets one rule, not two.
  - The comparison is constant-time.
- 🚫 **Nothing reaches the chat.** Wrong code · not configured · short · retired · over the miss limit **(even with the RIGHT code)** all produce **one identical reply** (`verify_admin_bad`), nobody is linked, and it counts as strike 1. Pinned through the REAL dispatcher; the reply is checked for no value, no length, and no reason words.
  - **The no-oracle rule holds:** the refusal can't tell a stranger they were close.
- **The log** says why (`unset` / `short` / `retired` / over the limit) **but never the typed text, the configured value, or its length** (pinned by value and by source).
  - The typed text is never logged at all: a near-miss of the real code would otherwise put most of it in a file.

## §1 (item 4) The rate limit: the shop-front's limiter REUSED, and why it was needed
- 🔴 **Finding: the two-strikes mute was NOT a limit.** The un-mute word `เปิดเมนู` clears the mute at once, so *miss, miss, un-mute, `สมัคร` → `แอดมิน`, repeat* was **an unlimited guessing loop**.
- **It fits, so it's reused:** `ShopfrontRateLimit` (TASK-475) counts **misses** per key in a window.
  - Its limits are now **constructor parameters**, and **its defaults are the old constants byte-for-byte** (the shop-front behaviour is pinned unchanged).
  - The admin gate keys it by **LINE user**: **5 misses per 60 minutes**, after which the code **isn't even compared**.
  - Pinned: the loop above no longer links, because the session was reset each time and the limit was not.
- **Its honest limits, the same as the shop-front's:**
  - it's **one process's memory**: a restart resets it, and it becomes N× under PM2 cluster mode;
  - **a new LINE account starts at zero**. The 8-character **strength** is what defends against account-farming; the limit makes walking the code from one account pointless.

## §2 📌 Approval-readiness: what would have to move
- **The gate is ONE call in front of the success half** (pinned: one `checkAdminCode`, before `addAdminLineUserId`).
- When approval arrives, **the gate stays untouched**. What moves is **the success half of `verifyAndLink`'s admin branch**: *add the id → link the admin menu → "linked ✅"* becomes *queue a request → "sent for approval"*, the way a teacher link already works (`requestTeacherLink` + TASK-520's end-the-conversation).
- **Also needed then (not built):** a place to store *who* and *when* (see §5: the current storage has neither), and **per-admin unlink**, which is the owner's other ask.

## §3 What did NOT move (pinned)
- Teacher and parent linking (the admin branch returns before either).
- `strikeOrPrompt` and the hand-off rule.
- `if (role !== "admin") await settleLinkedRole(...)`.
- TASK-524's `action=admin` handling.
- The success reply (`verify_admin_ok`).

## §4 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=16)
- **EX: the example restored:** **BITES** (3 fail).
- **DF: the default restored** (the old `?? "229"` check): **BITES** (5 fail).
- **WHY: the chat is told why the code was rejected:** **BITES**.
- **RL:** the miss limit disabled: BITES.
- **ST:** the strength weakened (min 3, the retired value allowed): BITES.
- **LG:** the typed text written to the log: BITES.

## §5 📋 DATA REQUEST for Porter (read-only; I ran nothing). Run on `uat` and on `sid`
⚠️ **First, what the data CAN'T give.** Sober asked for **display name and linked-at**, and **neither exists**:
- admin links are **bare LINE ids in ONE row**, `app_settings.line_admin_user_ids`;
- there is **no display name** (we never store an admin's LINE profile);
- there is **no per-link time**. `updated_at` is only **when the whole list last changed**.
```sql
-- READ-ONLY 1/2 — how many admin LINE links, and when the list last changed.
SELECT jsonb_array_length(value) AS admin_links, updated_at AS list_last_changed
FROM app_settings
WHERE key = 'line_admin_user_ids';

-- READ-ONLY 2/2 — each admin link, NAMED where our own data knows the person; never the full id.
SELECT '…' || right(a.id, 4) AS link_tail,
       t.nickname             AS also_a_teacher,
       p.name                 AS also_a_parent,
       p2.name                AS also_a_family_phone_of
FROM app_settings s
CROSS JOIN LATERAL jsonb_array_elements_text(s.value) AS a(id)
LEFT JOIN teachers t          ON t.line_user_id = a.id
LEFT JOIN parents p           ON p.line_user_id = a.id
LEFT JOIN family_line_links f ON f.line_user_id = a.id
LEFT JOIN parents p2          ON p2.id = f.parent_id
WHERE s.key = 'line_admin_user_ids'
ORDER BY 2 NULLS LAST, 3 NULLS LAST;
```
- **What the result CAN tell the owner:** how many admin links there are; which of them are people our data already knows (a coach, a parent); and **how many are unknown** (all columns empty, shown only as `…xxxx`).
- 🔑 **What it CANNOT tell him:** who linked **because of this hole** rather than legitimately.
  - **The two are INDISTINGUISHABLE in the data:** both are the same bare id in the same list, typed with the same code, which the prompt printed to everyone.
  - Even a "known" row (a coach) could have used the hole, and an "unknown" row could be a real staff member on a personal phone.
- ⇒ **Whether to empty the list and have real admins re-link with the new code is the owner's call.** We don't imply it.
  - If he decides to, that's **one write to one row**, which I'll draft as its own DATA REQUEST on his word.
  - After that, real admins re-link with the new code and get the admin menu (TASK-530).
- 📌 **To put a name to an unknown row** he'd need LINE's profile lookup against the real OA. That's a read, but **of the customer's OA**, so it's **his to run, never ours**. (Server logs may also hold `[line-in]` lines from the linking day, if they're kept that long.)

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28). **The door is shut.** ⚠️ **And I found something the suite count hides — TASK-535.**
Verified: `code_admin` carries **no example** (`line-i18n.ts:217`), **no `?? "229"` remains** in any live path, tsc 0, 60 = 60.

🔑 **"The fix closes the door; it doesn't empty the room" is the sentence I would have wanted and he wrote it himself.** Admin linking is now **refused everywhere until the owner sets a new code** — including **refused if the retired value is re-set**, which is the part that matters: *a "new" code that is the old one is the same hole with a fresh timestamp.*
🔑 **ONE identical reply for wrong / unset / short / retired / over-limit — even for the RIGHT code when the limit is spent** — so the chat cannot be used as an oracle, and **the log says why while never carrying the typed text, the value or its length.** That is the no-oracle rule applied to the only place where the person typing may be the attacker.
🔴 **And the finding is his, not mine: the two-strikes mute was NEVER a limit.** `เปิดเมนู` clears it, so **miss-miss-unmute-retry was unlimited.** ⇒ **there was no rate limit on admin-code guessing at all**, and my task asked him to *add* one while a broken one sat there looking sufficient. **Now pinned closed**, with the shop-front limiter reused and its own defaults unchanged.
✅ **Approval-ready and precisely stated:** the gate is one call in front of the success half, and approval would replace the success half without moving the gate. **Exactly what I asked for.**

## 📋 The DATA REQUEST — and his answer is better than my question
I asked for **display name and linked-at.** 🔑 **Neither exists: admin links are bare ids in ONE row, and `updated_at` is only the list's last change.** ⇒ he gives **the count, the last change, and each link named only where our data knows the person** (coach/parent), else masked.
📌 **And the conclusion I wanted stated is stated: hole-linked and legitimate admins are INDISTINGUISHABLE**, so **emptying the list and re-linking is the owner's call** — with the one-row write drafted only on his word. **I asked for the limits of the evidence and got them, including that my own question assumed data we do not keep.**

## ⚠️ What I found that his report could not: the suite is NOT reliably green
**I ran it four times.** Results: **3456/2 · 3458/0 · 3456/2 (database unreachable) · and the failing file fails ALONE with the database unreachable (20 pass / 2 fail).**
- **The file is `lib/teacher-own-calendar-req097.test.ts`** — the fail-closed route sweep — **the same file that produced the original "flake" in TASK-488.**
- **With the real database it fails intermittently (`ECONNRESET`); with none it fails every time.** ⇒ 🔴 **it reaches a real database**, which means **TASK-504's property — "the suite is green with no database" — has regressed.**
- 📌 **Not caused by this task** (nothing here touches that sweep), and **not his to absorb inside a security fix.** ⇒ **TASK-535, next.**
🔑 **This is why I run it myself rather than reading the number.** A report of green and a suite that is green four times out of four are different claims, **and only one of them is a gate.**
