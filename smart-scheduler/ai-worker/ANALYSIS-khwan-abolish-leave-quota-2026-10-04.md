# 🔴 Khwan: **abolish the leave counter; the course EXPIRY becomes the only control**
**Read by @Sober from a screenshot the human put in front of me directly, 2026-10-04.** 📌 **My answer goes UP through @Porter, as always — I am not replying to the customer and I have not acted on anything in it.**
🚫 **ANALYSIS ONLY. Nothing designed, nothing cut, no TASK.** 🔑 **I read the code before writing any of this; every claim below has a file behind it.**

---

## 1. 🔴 FIRST, THE URGENT PART — **this batch currently contains the opposite of what she just said**
**`TASK-609` is DONE, verified, and NOT YET DEPLOYED. It CAPS free pre-start absences at the quota the customer bought** — **the owner's own ruling on 10-02, and I asked for it.**
🔴 **Khwan has now said the opposite twice in one message:** *"ลาล่วงหน้าก่อนเริ่มคอร์สเราไม่จำกัดอยู่แล้วนะคะ"* — **she believes pre-start leave is ALREADY unlimited.**
✅ **And on the DEPLOYED build she is right: nothing caps it today. `TASK-609` is what would introduce the cap.**
⇒ ⚠️ **If this batch ships unchanged we ship a limit the customer has just told us she does not want, three days after she said so** — **and an at-cap refusal (`§T-609-CAP`) whose words the owner approved yesterday for a rule she is abolishing.**
⭐ **It costs NOTHING to change now and a full customer round-trip to change after.** ▶️ **That decision is the owner's, and it is the one thing here that cannot wait for the rest.**

## 2. 🔑 THE TRAP — **the expiry she wants as "the only control" is DERIVED FROM THE COUNTER she wants removed**
**`maxWeekFor(size, quota) = size + quota`.** **A course's validity window is literally *sessions + leave quota*, in weeks, and `courseExpiry(startDate, size)` is built from it.**
⇒ 🔴 **"Use the course expiry as the only control, no second counter" is self-referential as the system stands: delete the quota and the expiry formula loses a term.**
⭐ **Which is why I think she is describing a RENAME, not a removal** — **the number stops meaning "how many leaves you may take" and keeps meaning "how many extra weeks the course is valid for".** ✅ **If that is right, this is SMALL: the counter stops GATING, and the same number still sets the expiry.**
🔴 **If it is wrong, something else must decide how long a course is valid, and that is a different and much larger change.** 🔑 **ONE question decides between the two, and I would rather ask it than size both.**

## 3. ⭐ A CONSEQUENCE THE OWNER WILL WANT TO HEAR — **this dissolves the uat refusal she complained about**
**If a leave never consumes a counter, `leaveCharged` has nothing to mean.** ⇒ 🔑 **`UNDO_LEAVE_CHARGE_UNKNOWN` — *"ระบบไม่ทราบว่าการลานี้ใช้โควตาลาหรือไม่"* — becomes a question with no subject, and the whole refusal class DISAPPEARS.**
📌 **That is the exact refusal Khwan hit on live uat on 10-02 (item G), the one we reworded this week.** ⇒ ⭐ **Her change does not merely remove a cap; it removes the reason that refusal exists.**
⚠️ **And it makes two things we just shipped or approved redundant: the reworded `§T-G` refusal, and `§T-609-CAP`.** 🚫 **Neither is wasted work — both were right for the rule that was in force — but somebody should say so before the owner notices it himself.**

## 4. 🔴 "แจ้งแอดมินเหมือนตอนนี้" — **"like now" does NOT mean what she thinks it means**
**Her answer to question 1: a make-up that would fall past the course expiry is ALLOWED, and the system tells the admin, *"like it does now"*.**
🔴 **Today's admin notice (`makeup_far_out`) is triggered by the make-up SEARCH BEING EXHAUSTED — not by crossing the expiry.** **The code says so in as many words: the trigger is exhaustion, deliberately, because any distance would have been a number we invented.**
⇒ ⚠️ **The two overlap and are not the same: a make-up can land past the expiry without exhausting the search, and the search can exhaust without the expiry being crossed.**
⇒ 🔑 **If we build "like now", she gets a different notice from the one she is picturing, and we will hear about it.** ▶️ **This needs one sentence back to her, not a design decision from us.**

## 5. 📏 Rough shape, so @Porter can tell the owner what he is choosing between
**🚫 NOT a sizing — I have not been released to size it, and question §2 changes the answer.**
- **If §2 is a RENAME (the likely case): the counter stops gating.** **Touched: `lib/leave.ts` (the `leaveRemaining` / `leaveLocked` rule), the charge on a leave, the pre-start cap `TASK-609` just added, and `adminUnlocked`, which becomes vestigial.** **13 files mention the counter; most only REPORT it.** ⚠️ **The reporting is the risk, not the rule: a screen that still shows "2 of 4 leaves used" after the rule is gone is worse than one that never showed it.**
- **If §2 is a REMOVAL, something must newly decide the validity window, and that is a product decision before it is a code one.**
- 📌 **Either way `TASK-609`'s cap is the first casualty, and it has not shipped.**

## 6. ▶️ What I want to ask, through @Porter — **four questions, and only §6.1 is urgent**
1. 🔴 **Does `TASK-609`'s cap come OUT of this batch?** ⚠️ **The batch is a day from shipping; after that it is a customer-visible change to undo.** ⭐ **My recommendation: yes, take the cap out — keep the free pre-start absence, drop the limit.** 🔑 **It is a deletion, not a build, and it matches what she believes is already true.**
2. **When there is no leave counter, what makes a course expire?** 🔑 *Today it is "sessions + leave quota" in weeks. Is that number staying, as a validity window only — or does something else decide?* ⭐ **I expect "it stays, it just stops counting leaves", and that answer makes this small.**
3. **A make-up past the expiry: should the admin be told WHENEVER that happens** — or only when the search runs out, which is what "now" actually does? ⚠️ **She said "like now" believing those are the same thing. They are not.**
4. **Does a course still END on its expiry even if sessions remain unused?** 🔑 *She said "พอหมดอายุคอร์สก็จบ ลาต่อไม่ได้". If the expiry is the only control, it becomes the single thing standing between a family and a refund conversation, so it must be exactly right.*

🚫 **Nothing is being built on any of this.** ✅ **The batch continues as it is, except for question 1, which the owner should answer today.**
