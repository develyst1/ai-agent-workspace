# REQ-5009 — SOM Dashboard round 3: order + colours, Coach Capacity numbers + ECA/Camp, Gender/Nationality source, Address cleanup, Activity/Program (feedback from พี่ปุ้ม + พี่ตั้ม, via ขวัญ, 2026-11-08)
**From:** ขวัญ (LINE, the owner's screenshot + pasted text, 2026-11-08) · **Held by:** @Porter · **Status:** NEW — SA read + split; nothing built; no customer reply yet.
**Searched (role-pm §5):** CUSTOMER-ANSWERS.md (Coach Capacity); REQ-5002, REQ-5004 §1 (her round-2 words, 11-06). **Data:** none yet.
**Change vs a recorded answer:** Coach Capacity numbers were set on 11-06 (REQ-5004 §1): FT weekday 5 h + weekend 6 h, PT weekend 6 h, Karn 4 h, PT weekday FL not counted, FL no capacity. Round 3 **changes** them (FT 4 h / 5 h, PT 5 h) and adds ECA / Camp hours. This is a new ruling from the decision makers, not a repeat question.

## Her words, verbatim
> Feedback Dashborad จากพี่ปุ้มและพี่ตั้มค่ะ @Dong_08
>
> 1. ขอเรียงลำดับและใส่สีเพือให้อ่านและเข้าใจมากขึ้นนะคะ
> - ไลน์ Existing Customers
> เรียง Active course - Active voucher - Total customers
> *เป็นสีส้มนะคะ
> ต่อด้วย
> 1 HR (last 3 months) *สีส้มค่ะ
> 1st Trial (last 3 months) *สีเทาค่ะ / เพิ่มเติมแก้ชื่อนิดนึงค่ะ = 1st Trial (last 3 months) (มาลองแล้วไม่ชอบ)
>
> - ไลน์ New vs Renewing
> เรียงตามลำดับและเพิ่มสีนะคะ
> 1st Trial *เขียว
> *1st Trial - New Course *เขียว *เปลี่ยนชื่อจาก New Course this month
> 1st Trial, No Course *เทา
> New Course previous month *เขียว
> Renew Course *เขียว
> Course / Voucher not renewed *เทา
>
> 2. Coach Capacity
> - ต้องรวม ECA / CAMP ด้วยค่ะ นับเป็นรายชั่วโมง
> - ขวันขอเซ็ทเลขให้ใหม่นะคะ
> FT = วันธรรมดา 4hr * วันทำงาน
> วันเสาร์อาทิตย์ 5hr *วันทำงาน
>
> PT = วันเสาร์อาทิตย์ 5hr *วันทำงาน
> Karn **กรณีพิเศษ วันเสาร์อาทิตย์ 4 hr*วันทำงาน
> *** PT ที่มารับ FL วันธรรมดา ไม่ต้องคำนวณค่ะ
>
> 3. Gender / Nationality
> based on 166 of 202 students · not specified 36
> ** ขอทราบว่าเลขส่วนนี้มาจากฐานข้อมูลไหนคะ เพราะมันไม่สัมพันธ์กับอะไรเลยทั้งนักเรียนที่ลงทะเบียนในระบบทั้งหมดและเลข Total Customer ของเราค่ะ
>
> 4. Address
> - ที่เป็นย่อยๆ ผิดออกมาตั้งแต่เราให้ลูกค้าพิมเองรบกวนเอาออกได้ไหมคะ e.g.Supalai place tower B 179/271, Sukhumvit 39 Khlong Tan Nuea, Watthana, Bangkok 10110 / เขตจตุจักร แขวงจันทร / เกษม กทม.
>
> 5. Activity / Program
> - ยังไม่ตรง point  ที่พี่ปุ้มและพี่ตั้มอยากเห็นค่ะ ในส่วนนี้ขอโทรเพื่ออธิบายให้เข้าใจตรงกันนะคะ เผื่อพี่โด่งมีแนวทางการทำค่ะ แต่หลักๆ ที่ต้องการดูกันคือ ลูกค้าซื้อกิจกรรมอะไรเป็นพิเศษ แพ็คเกจกี่ชั่วโมง ค่ะ ** ซึ่งส่วนนี้ต้องสัมพันธ์กับ Total Customer + 1hr (last 3 Month) นะคะ

(The address example in item 4 is a customer's address she quoted; it stays in this REQ only, never copied elsewhere.)

## Porter's reading — not yet checked against the code
| # | ask | likely owner |
|---|---|---|
| 1 | Card order + colours (orange / grey / green) + 2 renames: "1st Trial (last 3 months) (มาลองแล้วไม่ชอบ)", "New Course this month" → "1st Trial - New Course" | screen (Palm's part, the owner sends) |
| 2 | Coach Capacity: include ECA + Camp hours in "hours taught"; new capacity FT weekday 4 h + weekend 5 h, PT weekend 5 h, Karn weekend 4 h; PT weekday FL not counted (unchanged); FL unchanged | back (Silver, REQ-5004's owner) |
| 3 | Where "166 of 202 students · not specified 36" comes from — she says it matches neither all registered students nor Total Customer | SA explains (read-only; uat read allowed) — no cause stated before that |
| 4 | Remove the free-typed address sub-parts (wrong since customers typed their own) | SA proposes what "เอาออก" means (hide sub-district/district detail? clean data?) |
| 5 | Activity / Program: what activity customers buy most, which package hours; must tie to Total Customer + 1 HR (last 3 months). **She asks for a call** | the owner (call), then a REQ amendment |

## Next
- Silver: one read-only CHECK file — items 2, 3, 4 (sizes; 3's source with the query/count; what 4's options are) — and confirm 1 is screen-only.
- The owner: the call for item 5; then Porter writes it up.
- One customer reply after the SA's findings + Tanya's gate (no holding message).

## Sent 2026-11-08 7:34 PM (owner's screenshot: "ส่งขวัญแล้ว")
Item 5 sample table v3 (Tanya PASS 6abd2d18) is in the LINE group. Not visible in the screenshot: the items 1–4 reply (PASS d1ecac20) and the Palm brief — status asked. Waiting: her answer on the table.

## Sent 2026-11-08 7:38 PM (owner's screenshot)
The 7:34 table was unsent; the combined items 1–5 reply (Tanya PASS d9f2bc5b) went at 7:38 PM. Palm brief sent 7:37 PM (Discord). Waiting: ขวัญ on the Activity table (item 5) and on the demographics base (item 3, optional); Palm's merge (item 1); Bob's capacity TASK (item 2).

## Item 1 built by Palm — 2026-11-08 20:58 (Porter, from the owner's Discord screenshot + git read-only)
- Palm (Discord "NeRo"): merged into `smart-scheduler-front` **develop**, `aee1e40` (reorder + colours) and `afdf41b` (stronger colours + hover). Front only, no API change.
- Checked against her words on paper:
  - Order and colours: Existing Customers = Active course → Active voucher → Total customers → 1 HR (orange) → 1st Trial (grey). New vs Renewing = order as asked, with 1st Trial, No Course and not renewed in grey and the rest green. **Match.**
  - Renames in `dictionaries.ts` on develop:
    - EN: "1st Trial - New Course" ✅ · "1st Trial (last 3 months) (Tried, didn't continue)". ⚠️ She wrote "(มาลองแล้วไม่ชอบ)" inside the English label; EN shows an English translation instead.
    - TH: "ทดลองเรียนครั้งแรก (3 เดือนล่าสุด) (มาลองแล้วไม่ชอบ)" ✅ · "ทดลองเรียนครั้งแรก - เปิดคอร์สใหม่".
- Not seen on a screen yet. It needs the owner's deploy of develop to uat, then Tanya's read-only screen check (order, colours, both languages).
- **Palm's answer, 2026-11-08 22:52 (Discord, via the owner), verbatim:** "1. deploy 2. ตามนี้". (1) The merge needs a deploy to uat; nothing else from us. (2) The EN label "(Tried, didn't continue)" is intended, so it stays as is. Next: the owner deploys, then Tanya checks the screen on uat (order, colours, labels in TH + EN).
