# DRAFT 2026-11-12 · for the owner to send to Palm (private chat). Source: ขวัญ, SOM group 15:13 (CUSTOMER-ANSWERS). Sober: the names are strings in smart-scheduler-front src/lib/i18n/dictionaries.ts:1842-1844 and :1883-1888, and the back end needs no change.

ปาล์มครับ ทางลูกค้า (พี่ปุ้มกับพี่ฟีน) ขอเปลี่ยนชื่อและเรียงลำดับการ์ดใน Dashboard หน้าบ้านตามนี้ครับ โดยขอให้ใช้คำตามนี้เลย ส่วนที่เป็นภาษาไทยให้ใช้ภาษาไทยครับ

EXISTING CUSTOMERS
- Active course
- Active voucher
- ลงเรียนเป็น ชม (last 3 months)  (เดิม 1 HR (last 3 months))
- Active Customer (Course + Voucher นับเป็นคน)  (เดิม Total customers)
- มาลองเรียนแล้วไม่ต่อ  (เดิม 1st Trial (last 3 months) (Tried, didn't continue))

NEW VS RENEWING
- 1st Trial
- 1st Trial - เปิดคอร์ส  (เดิม 1st Trial - New Course)
- 1st Trial - ไม่เปิดคอร์ส  (เดิม 1st Trial - No Course)
- Renew Course
- Course / Voucher not renewed
- New Course previous month

ตัวเลขทุกการ์ดใช้ค่าที่ back end ส่งมาอยู่แล้ว ไม่ต้องเพิ่ม API ครับ ฝากเช็กการ์ด Active Customer อีกทีว่ายังดึงจากยอดลูกค้าตัวเดิมอยู่ครับ

อีกเรื่องคือกราฟวงกลมครับ ลูกค้าขอให้มีแถว TOTAL อยู่บนสุดและใหญ่กว่าแถวที่แยกตามกิจกรรมข้างล่าง แบ่งเป็น 3 วงครับ
1. Active Course: นับจากคอร์สที่ Active ทั้งหมด ไม่รวม 1st / 1HR / Voucher ใช้ packages ที่ kind = COURSE รวมกันได้เลยครับ
2. TOTAL 1st Trial: ใช้ activities[].firstTrial ได้เลยครับ
3. 1HR + Voucher ที่จองในช่วง Period นั้น นับเป็นคลาส: ฝั่งเราจะเพิ่ม field ให้ใหม่ เสร็จแล้วจะแจ้งชื่อ field อีกทีครับ

ขอบคุณครับ
