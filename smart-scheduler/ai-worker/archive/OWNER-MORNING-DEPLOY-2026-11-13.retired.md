# deploy งานหน้าบ้าน 4 ชิ้น (13 พ.ย. 2569)

## sid: เสร็จแล้ว
ขึ้น git แล้ว (SB 738b6eb · SF 6c52040) · พี่ deploy จากเครื่องแล้ว · db:verify ผ่าน 81/81 ✅ · ตอนนี้ Tanya กำลังทดสอบ

## uat: ทำหลัง Tanya ผ่าน
1. พี่พิมพ์ "รวมโค้ด" แล้วตามด้วย "release code"
2. ทำขั้นปกติบน server ตอนไม่มีคนใช้ระบบ แต่ก่อน pm2 restart เพิ่ม migrate ดังนี้
   - `bun run db:preflight` ต้องได้ `4 pending migration(s): 0077_closed_days, 0078_slot_exempt_park_blocks, 0079_activity_changes, 0080_coach_time_ranges` ถ้าไม่ตรง ให้หยุด
   - `bun run db:migrate` (0078 ล็อกตาราง bookings ชั่วคราว)
   - `bun run db:verify` ต้องได้ Journal 81 · ledger 102 · witnesses 81 ✅ ถ้าไม่ตรง ให้หยุดก่อน restart แล้วส่งผลมาให้ผม

ยังไม่แจ้งขวัญ
