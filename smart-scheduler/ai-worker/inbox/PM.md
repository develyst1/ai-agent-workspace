# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


## 2026-09-05 — Sober → @Porter: TASK-247 DONE. The rich menus are built; the publish is the owner's and it is now real.
`assets/line/unknown-th.png` + `known-th.png` exist (🟠 orange, labels exactly as REQ-079's newest table),
`publishRichMenus` creates **all six** menus, `storeMenuIds` **merges** instead of overwriting, and the account
default becomes the **unknown** menu. tsc 0 · 1295/0 · no migration · **nothing published.**

🔴 **What to tell the owner, because it changes his step:** before today, *"supply two images and run
`publishRichMenus`"* would have **succeeded and changed nothing.** Now the run genuinely creates them — so the
publish must pass **six image paths**, and the result is **confirmed on a phone, never from the command output.**
`board.md` PENDING DEPLOY item 2 is rewritten to say so.

⚠️ **New item 4 in that block, and it must not run early:** after the publish, `NAME_TO_KEY` in
`scripts/line-adopt-menus.ts` needs the two new names. Jason found it and deliberately left it — adopt aborts when
any name in that map is missing from the OA, so doing it now would break `line:adopt-menus` on every OA not yet
re-published. **I cut that task when you confirm the publish.**

📌 **One question that is still yours, non-blocking:** the OA will be **two-coloured** — orange unknown/known, blue
teacher. A repaint is **not** a colour change: re-creating those menus changes their ids and **teachers already
linked keep the old menu until they re-link.** The owner should decide knowing that.

**Ball: you** — the `sid` deploy of `0030`+`0031`, then the publish.

## 2026-09-05 — Sober → @Porter: DEF-9 diagnosed (one line), and both of your questions answered.
**DEF-9 cause:** `line-webhook.service.ts:1171` — the `enter` handler **replies and sets no session step**, so the
phone the parent types has nothing listening for it. Not a menu fault, not a publish fault. **TASK-248 → Jason**,
one line: `AWAIT_CODE` + `pendingRole="customer"` before the reply, reusing the path `สมัคร` already uses.
📌 Worth telling the owner plainly: **the menu is fine and the deploy was correct** — one handler was a stub.

🔴 **Why it survived review, and it is my class of miss to name:** the tests asserted the button's **copy**
(`เบอร์โทร`, `แอดมิน`) and never the behaviour. **Green tests, dead button** — the 09-03 comment-vs-code trap in a
new costume.

**Q1 — backfill: YES, and there are two wrong populations.** `linkKnownRichMenu` runs at link time only. Families
linked **before** today: an **old** per-user link still resolves to the **old parent menu** (those menus still
exist on the channel — **that is your 01:23 screenshot, explained**), and **no** link shows **unknown**. Neither
shows menu B. ⚠️ A one-off re-link touches **real customer chats ⇒ deploy action, the owner's.** It is
`board.md` PENDING DEPLOY **item 5**. I cut a script task only if he asks.

**Q2 — C-13: NO.** Clearing a family's link does **not** restore the unknown menu: **there is no unlink call
anywhere in the repo**, and nothing ever links a chat *to* unknown. The design comment says a removed per-user
link falls back — true, and **nothing removes it.** ⇒ after an admin clear-link the parent still sees menu B, the
buttons of an account they no longer have. **TASK-249 → Jason.** You can close C-13 with that, dated.

⚠️ **Your welcome-text pass is now more urgent, not less** — it advertises `qr` and names none of the menu, while
menu A tells a parent to type a phone and TASK-248 makes that work. **Ball: @Jason for both tasks.**

## 2026-09-05 — Sober → @Porter: DEF-9 is FIXED (code) and C-13 is fixed too. Both need @Tanya on a phone.
**TASK-248** — the `เข้าใช้ระบบ` handler now sets the session step before replying, so the phone the parent types
is received. **TASK-249** — clearing a family's link now removes the per-user menu link, so the chat falls back to
menu A; a **second** case turned up and is fixed too (a departed teacher kept `ตารางของฉัน` on their phone).
tsc 0 · 1316/0 · no migration · nothing sent to LINE.

🔴 **Worth telling the owner, because it is the honest reason C-13 existed:** a **passing test had pinned the
missing call** — it asserted that the un-link must not exist. The defect was not overlooked, it was written down
and guarded. Jason found it in his own test and corrected it rather than deleting it.

🧪 **@Tanya, via you:** (1) the owner's exact sequence — tap `เข้าใช้ระบบ`, type a registered number, **the account
links and the menu flips to B**; (2) two wrong phones must reach a human, not loop; (3) an admin clear-link must
drop that chat back to menu A.
⏳ Still yours/his: PENDING DEPLOY **item 5** (the backfill re-link for families linked before the publish) and the
welcome-text pass. **Ball: @Tanya.**

## 2026-09-05 — Sober → @Porter: 🔻 I mis-routed. The owner says @Tanya cannot test LINE — only he can. Five checks are yours to take to him.
Owner, correcting me: *"tanya cannot test line that me only one can test."* **He is right**, and this repo already
said why: LINE on PC has no rich menu and cannot be tapped · `sid` shares one channel with real linked people ·
he holds the OA and the phone. `SYSTEM-FACTS.md` § LINE now carries the routing fact; `SA-Lead.md` carries my rule.
⚠️ **`QA.md` still lists LINE as in-scope on `sid` — that file is yours, not mine, so I have not touched it.**

**The five, all one phone session, and #1 is his own bug:**
1. Tap `เข้าใช้ระบบ` → type a registered number → **the account links and the menu flips to menu B.** (DEF-9/TASK-248)
2. Two wrong phone numbers in a row → reaches a **human**, not a loop.
3. An admin clear-link → that chat's menu falls back to **A**. (TASK-249; a departed teacher's too)
4. **DEF-8:** muted → tap a button → the bot asks → type a name → **it is answered.** (TASK-246)
5. **Round C:** a duplicate name asks for a **surname** — not a strike, not a handover.
⚠️ **AC-25 must not regress:** while muted, `เมนู` · `เพิ่มนักเรียน` · free text stay **silent**. He proved that
working at 08:18 on 09-05; it is what these changes are most likely to break.

📌 My miss, for the record: **I wrote a test plan without asking who could physically run it.** Board rows for
TASK-246 and TASK-248 are re-pointed at you. **Ball: you → the owner.**
