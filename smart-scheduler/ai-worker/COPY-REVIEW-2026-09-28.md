# COPY REVIEW — 2026-09-28
**Every draft string now waiting on the owner, in one place.** Compiled by @Sober for @Porter (requested 2026-09-28).

⚠️ **@Porter: the "Where / When" and "What it promises" lines below are MINE, in English.** 🔑 **You own the Thai.** If the owner reads this file directly rather than hearing it from you, **translate those two columns** — the TH/EN strings themselves are the things under review and must be shown exactly as they are.

## How to read this
- 📋 **DRAFT** = our words, waiting for his. 🔑 **Every one is pinned BY SHAPE, not by its letters** ⇒ **he can rewrite every word and nothing in the code breaks.**
- ✅ **APPROVED** = already his; listed only so he sees the finished sentence in context.
- 🔑 **What matters is the PROMISE, not the phrasing.** *The whole reason this list exists is that four screens promised things the system did not do.* **If a sentence claims something untrue, that is a defect. If he simply dislikes the wording, that is one line.**

---

# A. The leave dialog — what an admin reads BEFORE recording a leave
📌 **One sentence used to be shown for every leave: "a quota is spent and a make-up is added."** **It is false in four of the five cases below**, which is why there are now four.

### A1 · No course behind the session 📋 DRAFT
**Where / When:** the confirm dialog, the moment an admin records a leave on a 1-hour, trial, voucher or camp-day booking.
**TH:** คาบนี้จะถูกบันทึกเป็นการลา คาบนี้ไม่มีคอร์สอยู่เบื้องหลัง จึงไม่ใช้โควตาลาและไม่มีคาบชดเชย ระบบจะแจ้งครูและแอดมิน
**EN:** This session is recorded as leave. There is no course behind it, so no leave quota is used and no make-up session is added. The coach and the admins are told.
**Promises:** the leave is recorded and the coach and admins are told — **and explicitly NOT a quota and NOT a make-up.**
📌 *Why it says the negative out loud: an admin who believes a leave costs the family an entitlement avoids recording it — so the wrong sentence corrupts the record, not just the reader.*

### A2 · The course has no leave left 📋 DRAFT
**Where / When:** the same dialog, when the course's leave quota is used up and no admin has unlocked it.
**TH:** คาบนี้จะถูกบันทึกเป็นการลา คอร์สนี้ใช้สิทธิ์การลาครบแล้ว จึงไม่ตัดโควตาและไม่มีคาบชดเชย และจะยังล็อกการเลื่อนตารางไว้จนแอดมินปลดล็อก ระบบจะแจ้งครูและแอดมิน
**EN:** This session is recorded as leave. The course has no leave left, so no leave quota is used and no make-up session is added — rescheduling stays locked until an admin unlocks it. The coach and the admins are told.
**Promises:** recorded, nothing spent, nothing added, **and it names what the admin must do next** (unlock). *It borrows the words of the toast that appears afterwards, so the dialog and the outcome do not read as two different problems.*

### A3 · The leave was declared when the course was created 📋 DRAFT
**Where / When:** the same dialog, for a session the family declared absent at sign-up.
**TH:** คาบนี้จะถูกบันทึกเป็นการลา เป็นการลาที่แจ้งไว้ตั้งแต่สร้างคอร์ส จึงไม่ตัดโควตาลา แต่ยังเพิ่มคาบชดเชยต่อท้ายให้ ระบบจะแจ้งครูและแอดมิน
**EN:** This session is recorded as leave. It was declared when the course was created, so no leave quota is used — a make-up session is still added at the end. The coach and the admins are told.
**Promises:** **no quota, but a make-up IS added** — the only case where those two come apart.

### A4 · An ordinary course leave — ✅ unchanged, his existing words
Shown for a normal in-quota course leave. **Not under review; listed so the set is complete.**

---

# B. The Undo dialog — what an admin reads BEFORE undoing
📌 **These now say only what is ALWAYS true. Everything conditional moved into C, where the system states it per booking.**

### B1 · The three bodies — ✅ his approved verb and titles, trimmed
**TH (leave):** คาบจะกลับเป็นยืนยันแล้ว และคืนคาบเข้าโควตาของลูกค้า ระบบจะแจ้งครูว่าคาบนี้กลับมาเรียนแล้ว
**EN (leave):** The session goes back to confirmed and the class returns to the family's balance. The coach is told the class is on again.
*(attendance / check-in: the same, ending "ไม่มีการแจ้งใคร" / "Nobody is told.")*
**Promises:** only the act and who hears about it. 🔑 **The quota, the make-up and the expiry were REMOVED from these sentences** — they were claimed for every undo and are not true for every undo.

### B2 · The toast after it succeeds 📋 DRAFT
**TH:** ย้อนรายการแล้ว · **EN:** Undone
**Promises:** it happened. **One word; his to change.**

---

# C. The forecast — NEW, and the part most worth his eye 📋 DRAFT
**Where / When:** inside the Undo dialog, before the button. **The system asks itself what this undo would do, and says only that.**

| | TH | EN |
|---|---|---|
| heading | ถ้าไม่มีอะไรเปลี่ยนก่อนกดยืนยัน รายการนี้จะ: | If nothing changes before you confirm, this would: |
| leave back | คืนโควตาลาให้ลูกค้า | return the leave to the family's quota |
| make-up off | คาบชดเชยวันที่ {date} จะถูกยกเลิก | cancel the make-up session on {date} |
| expiry | เลื่อนวันหมดอายุคอร์สจาก {from} กลับเป็น {to} | move the course expiry from {from} back to {to} |
| nothing else | ไม่มีผลอื่นตามมา — ไม่คืนโควตาลา และไม่มีคาบชดเชยที่ต้องยกเลิก | Nothing else follows — no leave is returned and no make-up is cancelled. |
| **the caveat** | ระบบจะตรวจอีกครั้งเมื่อกดยืนยัน จึงยังมีสิทธิ์ปฏิเสธได้ | The server checks again when you confirm, so it may still refuse. |
| while loading | กำลังตรวจว่าจะมีผลอะไรตามมา… | Checking what this would change… |
| if the check fails | ตรวจไม่ได้ว่าจะมีผลอะไรตามมา ยังกดย้อนได้ ระบบจะเป็นผู้ตัดสินและจะแจ้งถ้าปฏิเสธ | We could not check what this would change. You can still undo — the server decides, and it will say so if it refuses. |
| if it will refuse | ระบบจะไม่ย้อนรายการนี้: | The server will not undo this: |

🔑 **"จะ" / "would" is deliberate, and it is the one word I would ask him not to strengthen.** **There is a rare case the system can only discover at the moment of the act**, so the sentence must make a late refusal an ordinary outcome instead of a contradiction.
🔑 **"ระบบจะไม่ย้อนรายการนี้:" is a HEADING** — the system's own refusal is printed underneath it, **word for word, never re-worded by us.** *A refusal we paraphrase is a refusal we can get wrong.*
📌 **"ไม่มีผลอื่นตามมา" exists because an empty list is exactly the silence that caused all of this.**

---

# D. The LINE accounts page (admin rights) 📋 DRAFT
**Where / When:** the LINE-links page, super-admin only — the list of LINE accounts holding admin rights, and removing one.

| | TH | EN |
|---|---|---|
| title | บัญชี LINE ที่มีสิทธิ์แอดมิน | LINE accounts with admin rights |
| hint | บัญชีเหล่านี้จะได้รับข้อความแจ้งของแอดมิน ซึ่งมีชื่อเด็กของครอบครัวอื่นอยู่ด้วย | These accounts receive the admin notices, which name other families' children. |
| unknown row | ไม่ทราบว่าเป็นบัญชีของใคร | Unknown account |
| button | ถอนสิทธิ์แอดมิน | Remove admin rights |
| dialog title | ถอนสิทธิ์แอดมินของบัญชีนี้? | Remove admin rights from this account? |
| dialog body | บัญชีนี้จะไม่เป็นแอดมินอีกและจะไม่ได้รับข้อความแจ้งของแอดมิน **ไม่ใช่การลบบัญชี** | It stops being an admin and stops receiving the admin notices. **The account itself is not deleted.** |
| after (coach) | ยังใช้งานในฐานะครูได้ตามเดิม | It keeps its coach access. |
| after (parent) | ยังใช้งานในฐานะผู้ปกครองได้ตามเดิม | It keeps its parent access. |
| menu not settled | ถอนสิทธิ์แอดมินแล้ว แต่ LINE ยังไม่รับการเปลี่ยนเมนู ระบบจะแก้ให้เองเมื่อบัญชีนี้เปิดแอปครั้งถัดไป | Admin rights removed. LINE would not accept the menu change — it will settle the next time the account opens the app. |

🔑 **Never the word "ลบ" / "deleted."** **The person keeps their coach or parent role**, and *a dialog that overstates its own button teaches an admin never to press it.*
🔑 **"ไม่ทราบว่าเป็นบัญชีของใคร" is deliberate honesty:** we store bare LINE ids, so **anything that looked like a name would be invented** — and **inventing one on the screen where you decide who keeps admin rights is worse than admitting we do not know.** 📌 **Those rows are also the ones most worth removing.**

---

# E. LINE messages

### E1 · The `ปฏิทิน` help line — ✅ APPROVED TODAY, already final
**TH:** · ปฏิทิน — ลิงก์เข้าเว็บ ดูตารางสอนบนมือถือ
**EN:** · Calendar — Link to the web app: your schedule on your phone
*Listed for completeness — locked by value, both languages.*

### E2 · What `ปฏิทิน` replies — 📋 DRAFT
**TH:** 📅 ตารางสอนของคุณอยู่ในระบบ SOM SCHEDULE: / {url} / แตะลิงก์ แล้วเข้าสู่ระบบด้วยบัญชีที่แอดมินให้ไว้
**EN:** 📅 Your teaching schedule is in SOM SCHEDULE: / {url} / Tap the link and log in with the account your admin gave you.
**Promises:** a link and a login — 📌 **deliberately not a calendar subscription**, since his own device check showed that button does nothing on Android.

### E3 · The cancelled make-up notice to the FAMILY — 📋 DRAFT (the new line he asked for)
**Where / When:** to the family, when a make-up class is cancelled.
**Title:** ❌ ยกเลิกคาบเรียน: / ❌ CLASS CANCELLED: — ✅ **his approved title, unchanged, and it never says "ชดเชย" / "make-up".**
**The new line — TH:** ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ {date}
**The new line — EN:** A new class has been added on {date}.
**Promises:** that a new class **exists, on that date.**
🔑 **It appears ONLY when the system actually added one, and the date is read from the class it added** — *not from an intention, a setting, or a calculation.* **No new class ⇒ no line at all**, exactly as before.
📌 **This is the whole point of his decision: the notice that caused this once told a family about a make-up that never arrived.**

---

# What happens after he answers
- **A word he changes is one line in one file.** 🔑 **No sentence's letters are load-bearing in code — the PROMISE is what the tests hold**, so his rewrites cannot break anything.
- ⚠️ **If he says a sentence is WRONG rather than badly worded, I want to hear it as a defect** — it means a screen is still claiming something the system does not do.

---

# D2. ⚠️ ADDENDUM — eight strings on the same page that §D **left out**
🔴 **My error, and I would rather correct it than let it pass.** **§D listed ten of the LINE-admin page's seventeen strings.** The owner's *"ผ่านหมด"* approved **what he was shown** ⇒ 🔑 **the eight below were never in front of him, so they are NOT approved. They remain drafts.**
📌 *Nobody may read silence as approval* — found by @Fern while pinning §D, and named rather than quietly folded in.

| | TH | EN |
|---|---|---|
| id tail | ไอดีลงท้าย {tail} | id ends {tail} |
| also a coach | เป็นครู {name} ด้วย | Also the coach {name} |
| also a parent | เป็นผู้ปกครอง {name} ด้วย | Also the parent {name} |
| after (neither) | จะไม่มีสิทธิ์พิเศษใด ๆ เหลืออยู่ | It keeps no special access. |
| confirm button | ถอนสิทธิ์แอดมิน | Remove admin rights |
| after it works | ถอนสิทธิ์แอดมินแล้ว | Admin rights removed |
| the "what we cannot show" heading | สิ่งที่หน้านี้แสดงให้ไม่ได้ และเหตุผล | What this page cannot show, and why |
| nothing in the list | ยังไม่มีบัญชี LINE ที่มีสิทธิ์แอดมิน | No LINE account has admin rights. |

**Promises:** nothing new. 📌 **They are the labels around the sentences he already approved** — the tail we show instead of a name we do not have, who the account also is, what it keeps, and the empty state.
⚠️ **Sent up with the next round.** **Everything in §A–§D and §E is unaffected and stays final.**
