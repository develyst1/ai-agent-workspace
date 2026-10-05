# ⛔ SUPERSEDED THE SAME DAY IT WAS WRITTEN — 2026-10-06. **These are NOT new items.**
🔴 **Every item below is `REQ-111` (A–F), intake 2026-10-02, intake CLOSED by the owner the same day, ruled 10-02 and 10-03, and all but one BUILT AND SHIPPED to uat in the combined 10-05 release.**
**Khwan was REMINDING the owner about item 6; the owner screenshotted the thread so Porter could see it. Porter read a screenshot as an intake and did not open the REQ.** 🔑 ***A customer message arriving as a screenshot is not evidence that the item is new.*** **Kept, not deleted — the error is the useful part.**

| my "new" item | what it really is | state |
|---|---|---|
| 1 Confirm results "ภาษาเอเลี่ยน" | **`REQ-111 B`** — and 🔑 **it was NOT encoding at all: `§4` resolved it on 10-02, the dialog printed raw BOOKING IDs where student names belong** | ✅ `TASK-621` DONE, shipped |
| 2.1 admin records a coach's leave | **`REQ-111 C`**, ruled 10-02 (own noun, no new key, the coach IS notified) | ✅ `TASK-608` DONE, shipped |
| 2.2 the grid does not show a coach is away | **`REQ-111 D`** | ✅ `TASK-622` DONE (grey cells), shipped |
| 3 · 4 | **she wrote "(เข้าใจแล้ว)" — not images, ANSWERED.** ⚠️ My "MISSING, not empty" was wrong in the other direction | — nothing owed |
| 5 the swap | **`REQ-111 E`** — and 🔴 **I misread "ครั้งต่อ ๆ ไป" as "ครั้งนี้"**, inventing a per-session requirement. **`§7` has her OWN verdict with a screen recording: widening Swap to any teacher "จะตรงที่ต้องการใช้งานเลยค่ะ"** | ✅ BE `TASK-629` shipped · FE `TASK-624` **in this week's build, as sized** |
| 6 pre-start planned absence | **`REQ-111 F`**, ruled 10-02 — **free, CAPPED at the quota bought** | ✅ `TASK-609` DONE, shipped |

## ✅ The only two things on this page that survived
1. 🔴 **A REAL interaction, and nobody had noticed it:** `REQ-111 F`'s cap is "the leave quota the customer bought" — **and `REQ-112` abolishes the quota.** ⇒ **the thing the cap counts against stops existing.** ▶️ **Sent to @Sober to settle inside the REQ-112 TASK.**
2. ✅ **Khwan accepted the parent-phone block in writing** — *"ถ้าที่โดนบล็อกแล้ว บังคับให้มีเบอร์เท่านั้นในการจองก็โอเคค่ะ"* ⇒ the first customer confirmation of `TASK-644`'s rule.

## What it cost
**A false STOP on @Fanta's TASK-624 and three code-reads asked of @Sober that he himself had already built.** Both withdrawn within the hour. 🔑 *The source was in this repo the entire time; I asked four people to re-derive what one `grep` would have told me.*

---
*(original text below, kept verbatim)*

# Khwan — new items, 2026-10-06 (via the owner, LINE screenshots) — recorded by @Porter
🚫 **Nothing here is answered to the customer yet.** 🔴 **Standing rule: counts are Porter's, CAUSALITY is the SA's — no cause reaches Khwan before an SA has read the code** (`SYSTEM-FACTS.md`; the rule exists because Porter broke it twice).
**Her numbering is kept.** **Items 3 and 4 are IMAGES ONLY in the screenshot and could not be read — ⚠️ they are NOT recorded as "nothing"; they are MISSING.**

---

## 1. "หน้า Confirm results ขึ้นเป็นภาษาเอเลี่ยนค่ะ"
- **What she reports:** the **Confirm results** screen shows unreadable text.
- **Two very different causes, and they are not the same bug:** (a) **missing dictionary keys** — the screen prints the KEY instead of the sentence; (b) **mojibake** — Thai text decoded wrongly.
- ▶️ **@Silver** (front-end): which is it, and which screen exactly? 🚫 **No answer to her until this is read.**
- ⚠️ **Porter needs the screenshot she sent** — "เอเลี่ยน" does not distinguish (a) from (b), and the fix is different for each.

## 2. She tried the coach-records-own-leave flow. Two questions.
### 2.1 "แอดมินกดลาให้ได้ไหมคะ ครูลายาวหลายวันน่าจะไม่สะดวกมากกันเอง"
- **Her case: a LONG multi-day coach absence** — doing it coach-by-coach, day-by-day is impractical.
- 📌 **`SIZING-teamA` / `REQ-112 §11` ruling 4 lists "an admin-recorded coach leave" as one of the five existing leave doors** ⇒ **it probably already exists.** 🚫 **"Probably" is not an answer to a customer.**
- ▶️ **@Sober: does it exist today, from which screen, and does it take a DATE RANGE or one day at a time?** 🔑 *Her question is really about the RANGE — "ลายาวหลายวัน" is the whole complaint. A door that exists but takes one day per click does not answer her.*

### 2.2 🔴 "ถ้าลาแล้วตารางไม่ได้ขึ้นบล็อก แอดมินน่าจะไม่รู้ว่าครูลา … ต้องกดเข้าไปจองแล้วถึงจะขึ้นว่าจองไม่ได้"
- **The grid does not SHOW that a coach is away.** The admin only finds out by trying to book and being refused.
- 🔑 **This is the same shape as the defect we just spent two days on: the product is not silent, it answers confidently and late.** The refusal is correct and arrives after the admin has already planned around a coach who is not there.
- **She asks for exactly one thing: a visible marker on the grid.**
- ▶️ **@Sober: does the grid have the coach-leave data to draw with, and what would a marker cost (FE, and BE if the day view does not carry it)?** 🚫 Do not design the marker yet; size the fact first.

## 3. ⚠️ IMAGE ONLY — not readable in the screenshot. **MISSING, not empty.**
## 4. ⚠️ IMAGE ONLY — not readable in the screenshot. **MISSING, not empty.**
▶️ **Porter owes the owner a request for these two.** 🚫 **Do not close the round's list while two of her six items are unread.**

## 5. 🔴 "ต้องเป็นการสลับครู ไม่ใช่เพิ่มครูรายครั้ง" — **this lands ON TASK-624, which Team B is building THIS WEEK**
**Her words, exactly:**
> ตอนนี้เหมือนแค่ครูไป "เพิ่ม" รายครั้งเฉย ๆ ไม่ใช่การที่ครูไปสอนแทน สลับกันไปสอนค่ะ
> **ตอนที่เป็น:** ครู B ไปสอนเพิ่มแค่ครั้งนี้ แล้วครู A ยังอยู่ — เอาครู A ออกแบบรายครั้งไม่ได้
> **สิ่งที่ต้องการ:** ครู A ไม่ได้ไปสอนครั้งนี้ · ครู B ไปสอนแทนครั้งนี้ · **ในตารางยังคงเป็นครู A อยู่ค่ะ**

- 🔑 **She is describing a ONE-SESSION COVER, and she wants it to REMOVE A for that session — while the SERIES still belongs to A.** Today (per her) it only ADDS B and leaves A on the session.
- 🔴 **This is NOT the same thing TASK-624 was sized for.** `SIZING-teamB` §1 sized "swap ANY teacher on the series" (the primary-vs-extra gap). **Hers is per-session: who is absent from THIS session, with the series unchanged.**
- ▶️ **@Silver, before @Fanta writes a line:** on an ECA session today, can a coach be taken OFF one session while the series keeps them? Is that the existing `cover` path, a different path, or missing? **If 624 as cut does not deliver her sentence, say so and I re-cut it.**
- ⚠️ **Highest-urgency item on this page purely because of timing** — Fanta starts Wednesday. 🔑 *Building the right fix for the wrong sentence costs the same as building it twice.*

## 6. "คอร์สที่ยังไม่เปิดใช้ ให้กด planned absence ได้ด้วยหรือเปล่าคะ โดยไม่ต้องนับโควตาการลา"
- **Her situation:** once the start date can be moved, parents declare more absences in advance.
- 📌 **`TASK-646` / `courseBornCeiling` already does pre-start declared absence at +1 week each, and REQ-112 §11 treats it as her rule** ⇒ **likely already true, and the quota question dissolves entirely under the ruled model.**
- ▶️ **@Sober: confirm for a course NOT YET STARTED (and specifically one not yet activated) that planned absence is allowed today, and say what changes under the ruled model.** 🚫 No answer to her before that.
- 📌 **She is waiting on this one specifically** — the screenshot shows "ข้อ 6 ที่ขวัญถาม พี่โด้งว่าไงบ้างคะ".

---

## ✅ Already settled in the same thread — no action
- **Preme / the parent-phone block:** she confirmed **"ถ้าที่โดนบล็อกแล้ว บังคับให้มีเบอร์เท่านั้นในการจองก็โอเคค่ะ"** ⇒ **TASK-644's behaviour is accepted by the customer in writing.** 📌 Worth keeping: it is the first customer confirmation of that rule.

## ▶️ Porter's next moves
1. **Dispatch 1 + 5 to @Silver, 2.1 + 2.2 + 6 to @Sober** — ✅ done 2026-10-06.
2. **Ask the owner for items 3 and 4** (the two unreadable images) and the **Confirm-results screenshot**.
3. **Hold the whole reply to Khwan as ONE batch** once the SAs answer. 🚫 No item-by-item replies (owner's standing instruction).
4. 🔴 **Do NOT send the round-close message (`COPY-DRAFT-khwan-round-close-2026-10-06.md`) as if her list were closed** — item 5 may change what the round delivers.
