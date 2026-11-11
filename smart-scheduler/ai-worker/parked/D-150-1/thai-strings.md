# D-150-1 (Tanya, TEST-150 §Block B) — Pay run + Slip to English — PREP INVENTORY (Fern, 2026-11-09)

Queued by Sober behind the Stock commit + the 931 un-park. **Nothing is edited yet** (the BF tree is Stock-only for the redeploy). Wording is **Porter's**: any word I am unsure of goes to him via Sober. This is only the inventory, taken from the front tree (`src/components/partials/Salary/`), so the pass is quick when it is released.

## Where the Thai is (file:line at 2026-11-09)
- `PayRun.tsx` — the title «Pay run · ภาพรวมรายเดือน» (123); period picker label/placeholder/locked suffix (134–138); new-period form «เดือน», «ปี (ค.ศ.)», «สร้างงวด» (145–167); the duplicate-month sentence (173) and the empty text (181); «ช่วงจ่าย» (199); lock text «ล็อกเมื่อ / ล็อกอัตโนมัติ … (12:00 วันสุดท้ายของเดือน)» (204–205); the run summary «Run แล้ว / Run ล่าสุด / สลิปใหม่ / อัปเดต / รายการอัตโนมัติ: เพิ่ม·แก้·ลบ / ไม่เปลี่ยน» (22–27, 243); the missing-rate warning title + hint (247, 257); locked / empty banners (263, 269); table heads «โค้ช · เงินเดือนฐาน · รวมสุทธิ · สถานะ» and «รวม N คน» (276–307); the lock-confirm modal (325–339); toasts «ล็อกงวดนี้แล้ว», «ส่งออก CSV ไม่สำเร็จ» (110, 117).
- `Slip.tsx` — «กลับไป Pay run» (53), «สลิป · <name>» + «ช่วงจ่าย» (65–69), the locked note (80), the add form «เพิ่มรายการ Other ± / เหตุผล / เช่น … / จำนวนเงิน (บาท) / ติดลบ = หักเงิน / เพิ่ม» (96–121), its errors (30, 32, 126).
- `SlipView.tsx` — «เงินเดือนฐาน» (41), «ยังไม่มีรายการเพิ่ม / หัก» (52), the delete aria-label «ลบรายการ» (75), «รวมสุทธิ» (89). (SlipView is shared with My slip, which Silver takes: agree the words once so both screens match.)
- `parts.tsx` — shared: «เกิดข้อผิดพลาด», «กำลังโหลด», «โหลดไม่สำเร็จ», «ลองอีกครั้ง», the slip status words «ร่าง / ยืนยันแล้ว / ล็อกแล้ว», the period status «ล็อกแล้ว / เปิดอยู่» (used by other screens too).
- `money.ts` — Thai short months in `shortDate` / `rangeLabel` («16 ต.ค.», «31 ต.ค. – 29 พ.ย. 2026»): used by Pay run, Slip and My slip.

## Watch-outs for the pass
- Tests assert many of these Thai sentences (salary-866/881/882 tests and the mutation anchors): they move with the words.
- Keep the **server's own sentences** as they come (Thai messages from the back end are Jason's, not a label).
- The Thai **toasts** of Entries / My slip belong to Silver's screens, not these two.
- One agreed word list first (Porter), then one pass: PayRun + Slip + SlipView + the shared bits.

## DONE 2026-11-09 (Fern) — see inbox/SA.md «D-150-1 DONE» for the report and the word list sent for Porter's review
All strings above are English now; `salary-english.test.tsx` pins it (no Thai character in PayRun/Slip/SlipView/parts/money; the shared words; the English dates). The Pay run menu/title label is plain «Pay run» (it was «Pay run (เงินเดือน)»).
