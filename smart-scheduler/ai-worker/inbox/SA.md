# Inbox — SA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


_(empty — DEF-9 diagnosed 09-05 → TASK-248; C-13 + the backfill answered → TASK-249 and PENDING DEPLOY item 5.)_

## 2026-09-05 — Porter → @Sober: 🔴 the bot is LIVE on the customer's OA. First customer change request + 3 unknowns.
**Owner switched the server's LINE channel secret + access token to the CUSTOMER'S OA today and restarted; their
webhook points at us and the typed commands answer.** Rich menus were published to the **demo** OA and **do not
travel with a token** — they are not on the customer's account.

**Customer's request (mine, written up): `REQ-079` §16** — the role step's `1 / 2 / 3` **collides with numbered
replies their OA already owns.** Replace with typed words (`ผู้ปกครอง`/`พ่อ`/`แม่` · `ครู` · `แอดมิน`); **bare
numbers must stop being accepted at that step.** **Your read, not my assumption:** are LINE quick-replies already
wired? If so the role question should be buttons and the collision disappears at source.
⚠️ **And a sweep: anywhere else the bot asks for a number.** The role step is where they hit it, not the only one.

🔴 **Three things I will not let anyone build on until they are answered — the first is the owner's:**
1. **Which box holds the customer's token — `sid` or `uat`?** If `sid`, every `sid` test now speaks through their
   live account, including tonight's ฿20 run. **Asked him. Nothing risky moves until he answers.**
2. **Are existing `family_line_links` rows still valid?** A LINE `userId` is scoped to the **provider**. If their
   OA is under their own provider, **no stored userId matches anything on the new account** — his test families
   and the 2 real teachers included. **Verify; do not assume either way.**
3. **PENDING DEPLOY item 5 (backfill re-link)** was written for one OA. **Do not run it** until 1 and 2 land.

**Ball: you for §16 + the number sweep. The three unknowns are mine to get answered first.**
