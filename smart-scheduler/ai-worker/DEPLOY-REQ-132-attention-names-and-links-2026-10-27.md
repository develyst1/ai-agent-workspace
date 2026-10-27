# DEPLOY — REQ-132 (TASK-840 + 841 + 842): the Attention items "ใกล้ใช้ครบ" / "ใกล้หมดอายุ" name the child, link to the course, and count ACTIVE courses only — sid first, then uat — @Sober, 2026-10-27
**For @Porter → the owner.** **Both apps go together.** No migration, no env change, no new words. **The LINE digest stays counts-only** (its course counts now drop the ended / paused courses, see 842).
> **Updated 2026-10-27 for TASK-842** (the owner's "ก": it rides with REQ-132). The back list is now 6 files. Tanya's §4 gains item 5.

## 0 · What is in it
- **840 (back):** every item of these two checks leads with the child's name (a DUO course names both), e.g. `น้องเอ · course 10 · เหลือ 2`. Each also carries a link target (course / voucher).
- **842 (back, Tanya's 🟡 on TEST-126):** both course checks now count **ACTIVE courses only**.
  - A course that was **ended (ตัดจบ / ยกเลิก) or paused (พักคอร์ส)** is in neither list. Before, `courseEligible` ignored that, which gave 15 of 44 on uat.
  - **The digest's counts drop accordingly** (≈ 44 → 29 on uat for "ใกล้หมดอายุ").
  - Vouchers were already right.
- **841 (front):** those items become links.
  - A course opens **its own "จัดการแผน" window** on the Bookings page (`/scheduler/bookings?course=<id>`).
  - A voucher opens its own plan window (`?voucher=<id>`, on the Vouchers tab).
  - An unknown id opens nothing, with no error. Every other Attention item is unchanged.
- **Not changed:** the expiry date inside the "ใกล้หมดอายุ" label still shows as before (ISO, e.g. 2026-08-10). It's a possible small follow-up if wanted.

## 1 · Verified by me on clean copies (final)
| | result |
|---|---|
| **back** `f4aeb39` + 6 files (**no `.env`**, 840 + 842) | tsc 0 · SAFE suite **5,236 / 0**, 373 files · unhandled 0 · migrations 73 = 73 · sets 842 **3/3** · 840 **7/7** (840's names + links byte-for-byte unchanged) |
| **front** `f9f7f9c` + 8 files | tsc 0 · `bun test` **1,392 / 0**, 147 files · unhandled 0 · **build 0** (the tree unchanged by it) · sets 841 **8/8** · 658 17/17. **Unchanged since** (md5s re-checked after 842) |

**Already proven:** TEST-126 PASS on sid for 840 + 841. **To re-prove on sid:** 842 (§4 item 5).

## 2 · Commit lists
### back: `smart-scheduler-back` (6)
```
 M src/lib/attention.ts
 M src/services/attention.service.ts
?? src/lib/attention-active-courses-only-task842.mutations.json
?? src/lib/attention-active-courses-only-task842.test.ts
?? src/lib/attention-names-the-child-task840.mutations.json
?? src/lib/attention-names-the-child-task840.test.ts
```
### front: `smart-scheduler-front` (8)
```
 M src/app/(admin)/scheduler/bookings/page.tsx
 M src/components/partials/Attention/AttentionContent.tsx
 M src/components/partials/Bookings/BookingsContent.tsx
 M src/types/app/attention/index.ts
?? scripts/mutation/task-841.json
?? src/components/partials/Attention/attention-link-task841.dom.test.tsx
?? src/hooks/scheduler/useOpenPlanFromLink.ts
?? src/lib/scheduler/attention-link.ts
```

## 3 · Deploy: sid, then (after Tanya) uat
Back: pull, restart. Front: the usual build + restart. Back before or with the front.

## 4 · Tanya's gate on sid
1. Attention page → "คอร์สที่ใกล้ใช้ครบ":
   - each item starts with the child's name (a DUO shows both);
   - **click one ⇒ Bookings opens on that course's "จัดการแผน" window.**
2. "ใกล้หมดอายุ" → the same for a course, and for a voucher (its own window, on the Vouchers tab).
3. **The morning LINE digest:** counts only, no names.
4. A user without the Attention menu still doesn't see the page. Other Attention items look as before.
5. **🆕 842: an ENDED (ตัดจบ / ยกเลิก) or PAUSED (พักคอร์ส) course is in NEITHER list.**
   - E.g. her 13 / 39 on sid should leave "ใกล้หมดอายุ".
   - The digest's "ใกล้หมดอายุ" / "ใกล้ใช้ครบ" counts match the page's (active only).
