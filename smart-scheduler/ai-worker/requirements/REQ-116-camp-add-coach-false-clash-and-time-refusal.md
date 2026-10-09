# REQ-116 — Camp week 12–16 Oct: adding a coach to a day is refused for reasons that are not true (LIVE on uat, the camp starts MON 12 Oct)

**Intake:** @Porter, 2026-10-08 ~11:00, from the owner's forwarded LINE thread with Khwan (08:51–10:47) plus three screenshots.
**Checked first (the screenshot-is-not-an-intake rule):** I grepped `requirements/`, `board.md` and `SYSTEM-FACTS.md`. Per-coach camp windows exist (`REQ-105` §"each coach on a camp day has their OWN time window"), and the camp clash refusal exists (`TASK-671`, the wording only). **Neither symptom below is recorded anywhere ⇒ this is new.**
🚫 **No cause is stated here.** Everything below is what the customer said or what the screenshots show. The cause is the SA's to find.

## Khwan's words, verbatim
> ทีมเข้าไปเพิ่มครูแคมป์คนที่ 5 (Kowjoe) วันจันทร์ที่ 12 แล้วระบบเตือนแบบนี้เพราะอะไรคะ
> ตอนแรกของครูอีกคนขึ้นแบบนี้ด้วยค่ะ ต้องกดเข้าใหม่ถึงจะบันทึกด้วย
> เคสเดียวกันค่ะ แคมป์วันที่ 12 ตอนเข้าไปเพิ่มตารางครูค่ะ
> ทั้ง 2 แบบเกิดตอนกดเหมือนกันคือเพิ่มครูสอนค่ะ 2 รูปแรกคือเพิ่มครู Kowjoe ขึ้นว่าครู Bank ติดสอนทั้งที่จริงๆ เราเพิ่มครู Kowjoe ไม่น่าเกี่ยวอะไรกับส่วนนี้ถึงเกี่ยว ก็ไม่ได้ติดสอนตามที่ในรูปแจ้งคืน ติดสอน 13.00 แต่เราลงครูแบงค์สอนแค่ 10.00-12.00 ค่ะ
> ส่วนครูป๊อปก็ตอนแรกว่างค่ะ ลงเวลาเรียบร้อยแต่ระบบแจ้งแบบนั้นค่ะ คือ ตั้งเวลาเริ่มและจบ ทั้งที่เราก็ตั้งไปแล้ว
> ถ้ายังไม่เข้าใจขวัญขอโทรอธิบายค่ะ
> ทีมแจ้งว่าชอบมีปัญหากับครู Bank ,Kowjoe , Pop, Haris

## What the screenshots show
**Symptom 1: a false clash, and it names the wrong coach.**
- Camp → *Edit 12-16 Oct* → day **12/Oct/26**. Coaches: Toth 10:00–15:00 · **Bank 10:00–12:00** · Pop 10:00–15:00 · Keng 10:00–15:00 · **Kowjoe 10:00–12:00 (being added)**. Day window 10:00–15:00.
- Refusal: **`วันที่ 2026-10-12 13:00 ครู Bank มีคาบแล้ว — ไม่ได้บันทึกอะไร`**
- The Schedule grid for Mon 12 Oct: Bank holds a private course at **13:00** (ต้นปุณณ์, LAST). The camp block on his column is 10:00–12:00.
- ⇒ The refusal names **Bank**, though the admin was adding **Kowjoe**, and it cites **13:00**, which is **outside Bank's own 10:00–12:00 window**.

**Symptom 2: "set both times", when both are set.**
- Same dialog, day 12/Oct: Keng 10:00–15:00 · **Toth 13:00–15:00 · Pop 13:00–15:00**. Both From and To are filled.
- Refusal: **`ครูที่ตั้งเวลาเองต้องระบุทั้งเวลาเริ่มและเวลาจบ`**
- Khwan: closing and re-opening the dialog, then saving, works. ⇒ **There is a workaround for symptom 2 today.**

**Pattern she reports:** it recurs with coaches **Bank, Kowjoe, Pop, Haris**.

## Why it is urgent
**The camp runs MON 12 – FRI 16 Oct (four days from today).** The admins are setting up its coaches now, on the customer's live system.

## What @Porter needs back (via @Sober)
1. **For each symptom: the cause, read from the code,** and whether it is reachable on uat today. 🚫 No guess.
2. **A workaround the admins can use TODAY**, if one exists. That goes to Khwan before any fix (the customer-self-serve-first rule).
3. **The fix, its size (your own estimate + 10%) and its claim.** No new words is expected. If a refusal's wording must change, draft it to me.
4. Whether **Haris** (13–15/Oct, the only coach) can hit either symptom. She named him.
