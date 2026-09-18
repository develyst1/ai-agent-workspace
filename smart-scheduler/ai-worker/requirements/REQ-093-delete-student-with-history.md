# REQ-093 — Delete a student that HAS history (loosen REQ-089 §3) — 2026-09-18

**Source:** the customer via the owner, 2026-09-18. **Status: DISCUSSION — PM read + a read requested from @Sober; owner to pick the direction. Nothing dispatched.**

## §0 — the customer's message (verbatim)
> ระบบให้ลบเฉพาะเด็กที่ไม่มีประวัติค่ะ อยากให้ลบเด็กที่มีประวัติได้ด้วย มีเด็กที่ขวัญสร้างคอร์สลงให้เรียบร้อยแล้ว คุณแม่มาลงทะเบียนใหม่ เชื่อมไลน์เรียบร้อย สร้างใหม่เลย ขวัญเลยย้ายไปใช้ user คนนั้น และยกเลิกคอร์สแรกค่ะ ถ้าบังคับให้ลบเฉพาะเด็กที่ไม่มีประวัติ ขวัญกลับไปลบคนแรกที่ขวัญสร้างให้คุณแม่ไม่ได้ค่ะ แม่ใช้อีกเบอร์ลงมาเลยค่ะ

## §1 — the case
A DUPLICATE student: Khwan created a child + a course; the mother later re-registered (new LINE link, new phone) and a NEW child was created; Khwan moved to the new user and CANCELLED the first course. The first child now has "history" (the cancelled course) ⇒ REQ-089 §3's history-free rule blocks its deletion ⇒ a duplicate is stuck in the system.

## §2 — the tension (PM)
REQ-089 §3 limited delete to history-free students precisely because **the product keeps financial history** (SYSTEM-FACTS: nothing with history is removed, only hidden; course creation posts a `bo.movement` SALE). A student with a cancelled course may still carry that posted sale ⇒ a hard delete would strand a ledger row (money), the backoffice's domain, against the owner's "money never disappears" principle.

## §3 — the READ requested from @Sober (no build)
1. **When a COURSE is cancelled/ended, is its creation SALE reversed, or does the `bo.movement` row stay?** If reversed, a fully-cancelled student carries no LIVE money ⇒ safe to remove.
2. What exactly does deleting a with-history student STRAND — bookings (cancelled), the course row, the sale, LINE links, badges? What cascades vs orphans?
3. Feasible shapes: (a) SOFT archive/hide the student (history + ledger stay, it leaves the working lists); (b) hard delete allowed when no LIVE money/attendance exists (only cancelled/void history); (c) a MERGE of the duplicate into the real student. Size each.

## §4 — options for the OWNER (recommendation after Sober's read)
- **(ก) Archive/hide** — safest, respects the money principle; the duplicate disappears from lists, accounting keeps everything.
- **(ข) Hard delete when no live money** — matches the customer's exact case (a cancelled course, nothing collected); needs Sober's confirm that cancel leaves no stranded sale.
⏳ Owner picks ก or ข; PM recommends after the read.

## §5 — OWNER, 2026-09-18: **shape (a) ARCHIVE** ("เอาตามนายว่าเลย" → PM's rec)
Build the ARCHIVE/hide-student shape: `students.archived_at` (migration +1); an archived student is hidden from every picker, list, calendar search, and the parent's roster count; history and the backoffice ledger are untouched (the money principle holds); un-archive is one tap. **This REPLACES the felt need behind "delete with history" for the duplicate case** — the mistake leaves the working views without destroying financial history. Merge (c) stays on the list for later if duplicates recur. Hard-delete (b) is NOT built.
