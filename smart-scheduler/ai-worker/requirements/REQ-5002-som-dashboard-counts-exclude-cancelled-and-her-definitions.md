# REQ-5002: som-dashboard-counts-exclude-cancelled-and-her-definitions
# REQ-5002: SOM Dashboard: counts include cancelled courses; the counts must follow the customer's own definitions; she asks how each number is counted
**Owner, 2026-11-05:** *"งานแก้ หรือ ตรวจสอบ frontoffice"*, with the screenshots. **Status:** OPEN: reproduce + check first.
**Background:** ฟีน, 11-04: *"อันนี้เสร็จได้เร็วสุดเมื่อไหร่คะ"* (reports first, the front office). The owner asked Khwan to check; these are her results. REQ-124 built this contract; the screen is Palm's (read-only for us), and the data is ours.
**The screenshots are in the owner's chat, not on disk.** Transcribed below; Tanya sees the same on uat.

## 1. Khwan's words (LINE, 2026-11-05), verbatim
**06:06, with a shot of Coach capacity (Bank · FT · Hours 101 / 234 h · Weekday 35 % 54 / 153 h · Weekend 58 % 47 / 81 h):**
> Coach capacity ที่ / hr ของครูคือ อะไร / อะไรหรอคะ

**06:26, with a shot of Renew Course (Oct 2026, 62 rows: จาญ่า จิรัญญาณ์ on rows 1, 2, 3 and 15) and of her Bookings page (Cancelled 3, Active 1, Completed 1):**
> ระบบนับคอร์สที่ cancel ไปแล้วด้วยค่ะ ตัวอย่างคือของจาญ่าค่ะ ระบบนับ 4 ครั้งเลยค่ะ

> เป็นทั้งหมดเลยนะคะ 1st + New course this month + previous + renew เลยค่ะ ที่นับคลาสที่ cancel แล้ว

> Existing customers
> 1 HR (last 3 months) = นับเป็นรายชื่อใช่ไหมคะ

**06:30:**
> ในแต่ละรายการ มีการระบุรายละเอียดเกี่ยวกับการนับจำนวนของระบบไว้ไหมคะ ว่าปัจจุบันระบบมีวิธีการนับอย่างไรบ้าง
> และมีเงื่อนไขหรือข้อจำกัดอะไรในการนับแต่ละรายการบ้างคะ
>
> อยากทราบรายละเอียดการทำงานของระบบในแต่ละส่วน เพื่อให้เข้าใจวิธีการนับและสามารถตรวจสอบข้อมูลได้ถูกต้องค่ะ

**10:40, after her call with the owner; this is the target (tags the owner and ฟีน):**
> สรุปให้อีกครั้งจากการโทรคุยนะคะ หากระบบยังไม่นับตามนี้จะขอรบกวนพี่โด่งไปแก้ไขตามนี้ค่ะ
>
> Active course = คอร์สที่มีตารางลงเรียนอยู่ ** ไม่รวมคอร์สที่ pause ไว้
> Active voucher = Voucher ที่มีการเปิดใช้งาน
> 1st Trial (last 3 months) = เด็ก 1st 3 เดือนที่ผ่านมา **ต่อคอร์สแล้วย้ายออก
> 1 HR (last 3 months) = เด็กที่ลงเฉพาะ 1hr ไม่เปิดคอร์สเลย 3 เดือนที่ผ่านมา
> Total customers = ลูกค้าทั้งหมดนับเป็นรายชื่อ
>
> 1st Trial = 1st ที่มาเรียนเดือนนี้
> New Course this month = เด็ก 1st เดือนนี้ เปิดคอร์สเดือนนี้
> New Course previous month = เด็ก 1st เดือนก่อนหน้านี้ ที่เปิดคอร์ส
> Renew Course = คอร์สต่อคอร์สและ Voucher ต่อ Voucher
> 1st Trial, no course = เด็ก 1st ยังไม่เปิดคอร์ส
> Course / Voucher not renewed = คอร์ส/ Voucher** ที่จบแล้ว** ยังไม่ต่อ
>
> ทั้งหมดต้องไม่รวมคอร์สหรือคลาสที่ Cancel ไปค่ะ

**A 06:26 message is cut off in the owner's screenshot.** The visible tail mentions teaching reports, activity statistics and back-office money. Not transcribed; Porter asks the owner for the whole line if it matters.

## 2. Acceptance
- **AC-1:** no card or its list counts a cancelled course or class, on any of the 11 lines above. จาญ่า's cancelled courses are gone from Renew Course; whether row 15 stays is decided by the data, not assumed.
- **AC-2:** each of the 11 lines counts by §1's definition. Every difference from today's behaviour is listed by Silver BEFORE anything changes.
- **AC-3:** a card's number = its list's row count = Tanya's independent recount on uat, for October 2026 and the current month. People lines are counted per person where §1 says so.
- **AC-4:** a plain definitions list for all 11 lines + Coach capacity (what "/ h" is), with its conditions and limits. It answers her 06:06 and 06:30 questions and her 1 HR question.
- **AC-5:** Bonus rules untouched. Dashboard "Renew = voucher after voucher" does NOT change R1's "Voucher after voucher is NOT a renewal" for Bonus 100 (REQ-120).

## 3. Rules
- Nothing to the customer about a cause before the SA confirms; no customer message before Tanya passes it.
- The fix is on the back if it can be. Anything needing Palm's screen comes to Porter, never to Palm directly.
- Deploys are the owner's.

## 4. Ruling, Porter 2026-11-05 (from her REQ-126 words; Silver's correction)
Cancelled = ended with any reason except ENDED_EARLY. ตัดจบคอร์ส stays in New / Renew, counts as finished, appears in Not renewed. 0 such courses on uat today (TEST-136). Open, not in this REQ: such a course may read "Cancelled" on the Bookings chip (Silver, from code; not seen on screen).

## 5. Rulings from her own words, Porter 2026-11-05. The 7 questions are withdrawn
Owner: *"ที่ยังถามขวัญนี่คือที่เขาพิมพ์มา ยังไม่เคลียร์เหรอ"*. Checked each against §1, the 10-11 sheet and the meeting notes. **These replace CHECK §3's defaults where they differ:**
| Q | ruling | her words |
|---|---|---|
| Q1 | cancelled after some classes = out | "ทั้งหมดต้องไม่รวมคอร์สหรือคลาสที่ Cancel" (ตัดจบ stays, §4) |
| Q2 | Active course counts **courses**, with a class scheduled, not paused; Active voucher counts **vouchers** | "คอร์สที่มีตารางลงเรียนอยู่", against "Total customers … นับเป็นรายชื่อ"; meeting 10-11 §3.1 "นับตามจำนวนตัวคอร์ส / จำนวน Voucher". **Supersedes K1 (people) and the CHECK's default** |
| Q3 | 1st Trial = attended | "1st ที่มาเรียนเดือนนี้" |
| Q4 | a course with no 1st Trial is on neither New line | "เด็ก 1st เดือนนี้ เปิดคอร์สเดือนนี้" |
| Q5 | trial in any earlier month + course opened in the selected month. "First course" is NOT in her words | sheet "นักเรียนใหม่เดือนอื่นมาเปิด"; meeting §3.2 "เดือนก่อนๆ ที่เพิ่งมาเปิดคอร์สในเดือนปัจจุบัน" |
| Q6 | a course bought while the earlier one still runs **is** a Renew. "Finished first" was our 10-18 default, never hers | "Renew Course = คอร์สต่อคอร์ส…" |
| Q7 | Total customers = all customers, each name once. Not the union of the 4 cards | "ลูกค้าทั้งหมดนับเป็นรายชื่อ" |
**To tell the owner, not to ask her:** Q5 and Q6 change the numbers; Silver and Tanya give them.

## 6. The 3 readings left by TEST-136, ruled by Porter 2026-11-05 (the gate needs one number each)
1. **Active course, past month:** a live class dated after month end, whatever its status now: Oct 188. It doesn't drift as classes are held. The limit goes in the definitions list.
2. **Total customers:** everyone known by the end of the selected month (current month: to today). Oct 523, Nov 535. Children with only ECA / camp / group rows are out: no course of their own (her 10-11 words on ECA).
3. **New Course this month:** any course: Oct 30, Nov 1. Her line has no "first course", same as previous month.
**The gate = TEST-136's last-section table, against the one build of TASK-754 + 755 together.** The earlier 35 · 2, 10 · 28, 40 · 19, 32 · 6 are retired.
**Known and told to the owner:** the same course can sit on New and Renew (Oct: all 5 New previous + 3 New this month). On no card: Oct 7, Nov 1.

## 7. Silver's flags on §5 + §6, ruled by Porter 2026-11-05
1. **New Course lines count a child's FIRST course: this replaces §5 Q5 and §6 item 3.** My §5 quoted the sources without "ลูกค้าใหม่ / นักเรียนใหม่"; her sheet's sample sums per child (Sep 13 − 5 = Oct 8). New this month 27 · 1; New previous 0 · 1. No purchase then sits on New and Renew together.
2. **Renew keeps §5 Q6 unless the owner says otherwise (he was on her call):** a course bought while another runs counts. The meeting summary says "เรียนจบแล้ว", a third party's paraphrase; her sheet and 11-05 line don't. Oct 55, Nov 20–21; flip = Oct 40, Nov 19. Asked the owner.
   **Closed 2026-11-06 by the owner:** *"ข้อ 1 ขวัญบอกมา ไม่ครบหรือไง ทำไมมาถามฉัน"*. Her words rule; no flip. The question shouldn't have gone to him.
3. **Total:** cut at the selected month's end; archived students out; ECA / camp / group-only children OUT (§6 stands). Tanya recounts.
4. Claim line for `archivedAt` in `src/services/som-contract.service.ts`: granted.
5. Her sheet's sample shows Oct New previous 8; the real data gives 0. Told the owner so it doesn't surprise him.
