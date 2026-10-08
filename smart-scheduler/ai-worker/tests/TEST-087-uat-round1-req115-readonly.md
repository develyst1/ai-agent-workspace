# TEST-087: uat READ-ONLY pass after round 1 + REQ-115 + 704 + 705 (back `6f7a40f` / front `f60d7e7`, Journal 67) · `DEPLOY-uat-2026-10-09.md` §8 · 2026-10-08

**Tester:** Tanya (QA) · uat (the customer's system) · **READ ONLY, headless**: GETs, and dialogs OPENED, READ and closed with Escape. 🚫 No confirm/save pressed; no leave, cancel or expiry edit. · Evidence `project-docs/qa-2026-10-09/UAT115-*.png`
## Verdict: ✅ **PASS on everything I can read.** One item is the owner's own count; one cannot exist on uat today.

| §8 item | seen | |
|---|---|---|
| **Build identity** (the running code, not the migrate) | a live booking DTO carries **`isMakeup`** | ✅ |
| **The AFTER marker count = the BEFORE `union_`** | ⚪ **the owner's SQL (§2a/§2b), not mine on uat.** What I can say: `0066` ran with **no RAISE**, so its own checks passed in the same transaction (`missed 0 · extra 0 · marked = expected · suspect 0`). The BEFORE/AFTER pair is the owner's numbers to set side by side. | ⚪ owner |
| **One EXISTING course's end date byte-identical** | **4 of 4** against what I recorded in TEST-079: ตินติน `1997fe76` **2026-11-21** · `66904c50` 2026-10-24 · `b40c7ec6` 2026-11-17 · `9937e8cb` 2026-11-18 | ✅ |
| **An existing unconfirmed make-up still shows «ขยายคาบ»** (marked by the backfill) | `status=EXTENDED` from today: **310 rows**; a sample of 50 is **50/50 `isMakeup=true`**, all still EXTENDED (forward-only). Sample *Flow*, coach Print, **10/10 10:00**: the plan row is `EXTENDED · isMakeup true`; the **grid** cell reads *"Flow · **ขยายคาบ** · คอร์ส · Private SURFSKATE"* | ✅ `UAT115-C-grid.png` |
| **No "x of y" / quota / lock word** | 11 course cards + a plan modal: **0 hits** | ✅ `UAT115-D-cards.png` |
| **A course card's week = its real end date** | **190 / 190** ACTIVE courses: `maxWeek` = the week of the stored expiry (incl. the 6 that showed the old floor in TEST-079: now 10 / 9 / … matching their real dates) | ✅ |
| **«ปัญหาจากทางเรา» on the plan's CLASS cancel** | Aiwa's plan → a class → *ยกเลิกคาบ*: *"ยกเลิกคาบเรียนนี้ … **ปัญหาจากทางเรา** · เลือกข้อนี้เมื่อคาบถูกยกเลิกเพราะทางเรา — ระบบจะขยายอายุคอร์สให้ 1 สัปดาห์"*: 1 checkbox, **unchecked** · closed, not confirmed | ✅ `UAT115-F-class-cancel.png` |
| **…and on the GROUP cancel-all** | ⚪ **no GROUP series exists on uat** from today on (`GET /group-series`: none of kind GROUP; this week's series are all ECA). Proven on sid (TEST-080 §GROUP, TEST-086) | ⚪ n/a on uat |
| **NOT on the non-course dialog** | an existing Voucher booking (Time Talisha, 10:00) → *ยกเลิกการจอง*: reasons **ลูกค้าเปลี่ยนกิจกรรม · ลูกค้าไม่เอาแล้ว · แอดมินคีย์ผิด**, no «ปัญหาจากทางเรา», 0 checkboxes · closed, not confirmed | ✅ `UAT115-F-non-course.png` |
| **NOT on Ending a course** | Aiwa's plan → *ยกเลิกคอร์ส*: **ลูกค้าเปลี่ยนกิจกรรม · ลูกค้าไม่เอาแล้ว · แอดมินคีย์ผิด**, no «ปัญหาจากทางเรา» · closed, not confirmed | ✅ `UAT115-F-end-course.png` |

📌 My first run missed three dialog reads (selectors: the TH series-panel label; the end-course button in the wrong layer; a "paused" side-panel card taken for a grid cell). They were re-run read-only and are recorded above. Nothing was clicked beyond opening and Escape.
**Footprint on uat: none.**
