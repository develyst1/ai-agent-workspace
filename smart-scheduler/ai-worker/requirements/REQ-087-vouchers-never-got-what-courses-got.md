# REQ-087 — Vouchers never got what courses got

**From:** the customer via the owner, 2026-09-10 · **Held by:** @Porter
> **Customer:** *"พี่โด่งคะ ทำไม คอร์ส Deduction ของ Voucher ไม่มีติด remark มาด้วยค่ะ"*
> **Owner:** *"มีเรื่อง VOUCHER ด้วย เราไม่เคยทำไม่เคยเทสเลย น่าจะมีอะไรที่ยังไม่ดี หรือเทียบเท่ากับพวกคอร์ส
> … และในรูป ยังขึ้นข้างบนว่า คอร์ส ด้วย มันควรเป็น VOUCHER หรือเปล่า"*

## 🔑 THE POINT OF THIS REQ IS THE OWNER'S SENTENCE, NOT THE CUSTOMER'S BUG
**The customer reported ONE missing field. The owner named the CLASS: *vouchers were never built or tested to
the standard courses were.*** ⇒ 🔴 **fixing the `Remark` line answers the report and leaves the class.**
📌 **This week has already shown what that costs:** **`Remark`, `Date`, the trailing blank line and the seconds
were each reported as ONE message and each turned out to be several.** **Every time, the sweep found more than
the report.**

## §1 What the message actually shows — the owner's screenshot, `sid`, 6:30 PM
```
💡 COURSE DEDUCTION
Student : ปลางา · Program : Inline Skate
Date : 2026-09-10 · Time : 17:00-18:00 · Coach : Kowjoe
Remaining : 14/15 ครั้ง
*Expiry date : 2027-06-10
```

### 🔴 1a — the header says `COURSE DEDUCTION` on a VOUCHER
**The owner's question, and my answer is yes.** ⇒ **a voucher is not a course; the parent is told the wrong
noun about their own purchase.** 🔑 **And it is not cosmetic: a family holding BOTH would read two identical
headers for two different things they paid for separately.**
❓ **Wording is the customer's** — **they own these messages** (`REQ-085 §7`, `§16`). **@Porter to ask, with a
proposal rather than an open question.**

### 🔴 1b — `Remark` is missing. **The customer's actual report.**
🔗 **`REQ-085 §8.1`: `Remark` prints only when there is one** — **so the fix is to CARRY it, not to always show
it.** ⚠️ **And `TASK-320` has just taught us the shape to check first: the note reached the message under the
WRONG NAME.** 🔑 **Check the name before concluding the field is absent.**

### 🔴 1c — `Remaining : 14/15 ครั้ง` — **THAI in a system-generated value**
🔗 **`REQ-085 §4`: labels AND system values are ENGLISH; only what a human typed stays as typed.**
⇒ **`ครั้ง` is ours, not the admin's.** 📌 **Nobody reported it. It is the same defect as `Date : อังคาร`, in the
one message family nobody swept.**

### ❓ 1d — TWO deductions, same student, same DATE, same TIME `17:00-18:00`
**Different programs (`Inline Skate` / `Freeskate`), different coaches (`Kowjoe` / `Haris`), `14/15` then
`13/15`.** ⇒ ❓ **a child cannot be in two places at 17:00.**
🚫 **NOT called a defect** — it may be two legitimate bookings the owner made while testing. **But it is exactly
the kind of thing a course would have been checked for and a voucher never was.** **Asking him.**

## §2 ⛔ WHAT I AM ASKING FOR — a COMPARISON, not a fix
**For every notification and every flow a COURSE has, what is the VOUCHER equivalent, and does it exist?**
📌 **Confirmation · deduction · expiry · pause/resume · leave · the daily and weekly schedules · the admin
screens.** 🔑 **The deliverable is the TABLE, not the repairs** — **so the owner can decide what is worth doing
rather than being handed a queue.**
⚠️ **And I expect the answer to include *"a voucher has no equivalent of X, by design"* in places.** **Those are
the valuable rows: a gap that is a DECISION should be written down as one, not rediscovered as a bug.**

## §3 — OWNER, 2026-09-11: **`uat` WAITS. The voucher items ship WITH this release.**
> *"ไม่ได้ ขึ้น uat ไม่ได้ ต้องเก็บเรื่องแจ้งไปก่อน"* — confirmed as `REQ-087`, not `TASK-334`.
🔴 **This REVERSES my own routing.** **I told @Sober `REQ-087` was *"not in the current batch, does not block the
`sid` deploy"*.** ⇒ **it now blocks `uat`.**
🔑 **And he is right to hold it.** **The customer reported it BEFORE the release went to their box** ⇒ **shipping
to `uat` now would put their own reported defect on their own system, with our name on the deploy.**
📌 **The cost of holding is a day; the cost of shipping is that the next thing they report, they report to
someone who already shipped past the last one.**

### ▶️ What ships — `§1a` `§1b` `§1c`, and the TABLE still comes first
🚫 **`§2`'s comparison table is NOT dropped** — **but it stops being the deliverable and becomes the SCOPE
CHECK**: 🔑 **@Sober produces it, and if it shows a fourth voucher defect of the same size, that ships too;
if it shows twelve, we ship these three and the owner decides the rest.**
⚠️ **I am not letting "vouchers were never done" become an open-ended hold on `uat`.** ⇒ **the release waits for
the REPORTED items and whatever the table proves is their equal, not for vouchers to be finished.**
❓ **`§1d` (two deductions at the same hour) is still a QUESTION to the owner and does NOT hold the release**
unless his answer makes it a defect.

## §4 — SCOPE SET BY THE OWNER, 2026-09-11: **NOTIFICATIONS ONLY.**
> *"อย่างน้อย เอาแค่ noti ของ voucher ก็ยังดี"*
✅ **The `uat` hold covers the voucher NOTIFICATIONS and nothing else.**
🚫 **OUT of this release: the admin screens · pause/resume equivalents · the flows · anything a voucher does not
do in a MESSAGE.** ⇒ **`§2`'s comparison narrows to ONE question: *for every notification a COURSE sends, does
the VOUCHER equivalent exist, and is it right?***
🔑 **He set the boundary before the table arrived, which is the better order** — **a scope decided by what
matters beats a scope decided by what a sweep happened to find.**
📌 **And it is the right cut on the merits: a message is what a PARENT sees.** **An admin screen gap is felt by
the school's own staff, who can ask; a wrong message reaches a family who cannot.**
⚠️ **The rest of `REQ-087` is NOT withdrawn** — **it stays open, off the clock, and off the release.**

## §5 — OWNER, 2026-09-11: **`Remark` goes on BOTH deductions. Do not ask the customer.**
> *"เพิ่มทั้งคู่เลยไม่ต้องถาม"*
✅ **`Remark` is added to the COURSE deduction and the VOUCHER deduction.** 🚫 **No question to the customer.**
🔑 **He is right and the reason is `REQ-085 §8.1`: the rule is `*ถ้ามี` — the line appears only when a note
exists.** ⇒ **adding it can never make a message noisier than it was; the worst case is that it changes
nothing.** **A change that cannot make things worse does not need permission.**
📌 **And it closes the customer's report COMPLETELY rather than half.** ⇒ **the message the owner was about to
send becomes an FYI, not a question.**
⚠️ **`§1b` therefore now BLOCKS `uat` again** — **@Sober had it OUT of the release on my instruction.** 🔻 **My
call was "answer the report and tell them the rest"; the owner's is "answer the report".** **His is better.**
