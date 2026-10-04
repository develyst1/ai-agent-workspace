# COPY DRAFT — "no class today" when the truth is "nothing confirmed yet" — @Silver, 2026-10-04
📋 **DRAFT. Nothing is shipped.** `line-i18n.ts` does not change until the owner approves these words (Porter's rule).
**The ruling it serves (owner, 2026-10-04):** a parent may NOT check in to an unconfirmed class. The fix is **wording only, and the act does not change.**
**Porter's brief for the sentence:** it says the class exists but nobody has confirmed it, **without blaming the parent and without promising that waiting will fix it.**

## 🔑 One limit the owner should know before choosing
**The bot cannot tell "no class at all" from "a class nobody confirmed".** Its check-in list reads confirmed classes only (`checkin.service.ts:154-160`).
- ⇒ **With wording only, the one sentence must be true in BOTH cases.** That is draft **A** below.
- **To say "you HAVE a class, it is not confirmed yet" only when that is true**, the bot needs one extra read: today's unconfirmed classes, read only, with the act unchanged.
  - That is option **B**. It is a small code change in Team A's file (`line-webhook.service.ts`), so it is not wording only. **It is offered, not proposed.**

## Draft A — one sentence, true in both cases (recommended: it fits "wording only")
**`empty_checkin`** (the check-in button with nothing confirmed today), sent at `line-webhook.service.ts:951`.

| | Today | Draft |
|---|---|---|
| TH | วันนี้ไม่มีคลาส | **วันนี้ยังไม่มีคลาสที่ได้รับการยืนยันค่ะ หากน้องมีเรียนวันนี้ คลาสอาจยังรอแอดมินยืนยันอยู่ รบกวนติดต่อแอดมินเพื่อยืนยันคลาสก่อนเช็คอินนะคะ** |
| EN | No class today | **There's no confirmed class for today yet. If your child has a class today, it may still be waiting for the admin to confirm it. Please contact the admin to confirm it before checking in.** |

- ✅ **It does not say there is no class.** "If your child has a class today" covers both truths.
- ✅ **It does not blame the parent.** The waiting is on the admin's side.
- ✅ **It does not promise that waiting fixes it.** It names the one next step, which is contacting the admin.

**`qr_none`** (the QR check-in with nothing confirmed), sent at `:960`. Today it reads *"วันนี้ไม่มีคาบที่ยืนยันแล้ว / No confirmed class today"*. That is true but terse, and it gives no next step.
- ⇒ **Use the SAME text as `empty_checkin`**, so one approval covers both doors.

## Draft B — only if the owner wants the precise version (needs the extra read)
- **A class exists today, unconfirmed:**
  - TH *"น้องมีคลาสวันนี้ แต่คลาสยังไม่ได้รับการยืนยันจากแอดมินค่ะ จึงยังเช็คอินไม่ได้ รบกวนติดต่อแอดมินเพื่อยืนยันคลาสนะคะ"*
  - EN *"Your child has a class today, but it hasn't been confirmed by the admin yet, so check-in isn't available. Please contact the admin to confirm it."*
- **Truly nothing today:** keep a plain *"วันนี้ไม่มีคลาสค่ะ / No class today"*. That is honest only in this branch.

## ⚠️ Other live sentences with the same problem (Porter asked me to flag them)
| Key / site | Says | The truth is | Recommendation |
|---|---|---|---|
| **`empty_leave`** (`line-i18n.ts:294`; leave list, CONFIRMED-only) | *"ไม่มีคาบที่จะแจ้งลาค่ะ / You have no upcoming classes to cancel"* | there may be unconfirmed or make-up classes | **The structural fix is next round's leave-window item** (TASK-598's rule). Once the window includes them, this sentence becomes true. If that item slips, it needs the same wording treatment. Separately, the EN says "cancel" for a leave. |
| **The thrown refusal** `checkin.service.ts:109` | *"คาบนี้ยังไม่พร้อมเช็คอิน (ต้องยืนยันตารางก่อน)"*, **Thai only** | an unconfirmed class reached the act (rare: a token for a class that was un-confirmed after it was minted) | It reads as if the **parent** must confirm. Suggested text: TH *"คลาสนี้ยังไม่ได้รับการยืนยันจากแอดมินค่ะ จึงยังเช็คอินไม่ได้"* / EN *"This class hasn't been confirmed by the admin yet, so check-in isn't available."* ⚠️ The file is not in Team B's claim. |
| **Shop QR** `NOT_CHECKINABLE` (`shopfront-checkin.service.ts:34`) | *"ไม่มีคลาสให้เช็คอินในขณะนี้ / No class to check in right now"* | the same CONFIRMED-only read (`:53`) | 🚫 **Recommend NO change.** It is a **deliberate privacy guard**: "one neutral sentence for every nothing, never a name, never a reason". At the shop counter, anyone who types a phone number must learn nothing. Saying "you have a class" there would leak it. |
| `num_notfound`, `checkin_notfound` | "No class for that number" / "Class not found" | about a picked number, not the day | No change. |

## How this lands next to the admin-help line (next round, item 2)
- Draft A already ends by pointing to the admin.
- When the help line ships, `empty_checkin` and `qr_none` join the **8 refusals that already say "contact admin"** and are reconciled there, so the parent is not told twice.

---

## 🔴 AMENDMENT, same day: Draft A names the wrong cause for a THIRD case that is live on uat (Silver, 2026-10-04)
**Source:** Sober's proven uat defect (`log/2026-10-04.md`, "the uat defect: cause PROVEN"). Read, not messaged.
- A child created by the booking path with no parent is **unreachable from every parent door.** The mother of "Ari Khosla" pressed check-in for a **CONFIRMED** class and was told "no class today".
- **Scale on uat: 4 households** with future confirmed sessions are in this state now. The code fix is promised to the customer.
- ⇒ **The bot's "nothing" has THREE causes, not two:**
  1. there is truly no class;
  2. the class is not confirmed yet;
  3. **the class exists and is confirmed, but the child is not linked to this LINE account.**
- 🔴 **Draft A says "it may still be waiting for the admin to confirm it".** For case 3 that sends the mother to the wrong explanation, even though "contact the admin" is the right next step.

### Draft A′ — replaces A (recommended): true in all three cases and names no cause
| | Draft A′ |
|---|---|
| TH | **วันนี้ไม่พบคลาสที่ยืนยันแล้วสำหรับบัญชีนี้ค่ะ หากน้องมีเรียนวันนี้ รบกวนติดต่อแอดมินเพื่อตรวจสอบก่อนเช็คอินนะคะ** |
| EN | **We couldn't find a confirmed class for today on this account. If your child has a class today, please contact the admin to check it before checking in.** |
- ✅ "**on this account**" is true in case 3 (the class belongs to a record not linked here) and harmless in cases 1 and 2.
- ✅ "**to check it**" instead of "to confirm it": it does not guess the cause. That is Porter's "no blame, no promise" rule, extended to "no wrong diagnosis".
- ✅ `qr_none` should still use the same text.
- **Draft B** (the precise "you have an unconfirmed class") would still be accurate where it fires, because it only fires when an unconfirmed class is found. It cannot see case 3 either.
- 📌 **Once the parentless-child fix ships, case 3 should stop occurring.** A′ stays correct either way, and is not weakened by the fix.
