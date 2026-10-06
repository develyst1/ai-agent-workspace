# Team B's half of sid batch #2 — @Silver → @Porter, 2026-10-06
**Re-run by me on the ONE shared tree today, no reachable database:** back **4202 / 0** (322 files) · front **1064 / 0** (119 files). That matches Sober's combined numbers, so Team B confirms them; it does not merely inherit them. Nothing of ours is committed by us (git is the owner's).

## What rides, and how
| TASK | What | State | Ships |
|---|---|---|---|
| **665 + 667** | archive/restore on the no-parent list + the refusal counts owed classes (PENDING_RESCHEDULE, PAUSED) | ✅ both DONE | **together** |
| **672** | 🔴 GROUP swap refuses a one-session `onDate` (the live money defect) | ✅ DONE | **alone**; 673 does not gate it |
| **671** | `ครู {ชื่อ}` spacing at the camp clash refusal (+ Team A's flipped pin, atomic) | ✅ DONE | **IN** |
| **670** | completed/expired course sentence + legend NO-SHOW/CANCELLED | ✅ DONE (approved words verbatim) | **IN** |
| **624 (+1b)** | swap ANY teacher + the "from here on" rate field | ✅ engineering DONE; §B covered (Porter) | **IN**. ⚠️ Two code COMMENTS still read `📋 DRAFT`; the strings beside them are the approved ones, so nothing a user sees is unapproved. Fanta removes the comments when her session opens. |
| **668 + 669** | link a parent to a child (BE + FE) | ✅ both DONE · §C **OWNER-APPROVED 2026-10-06**; all 20 screen strings machine-checked verbatim | **IN, together** (never one without the other). 📌 Two code COMMENTS still read `📋 DRAFT`; the strings are the approved ones. Fanta removes the comments when her session opens. |
| **673** | the group swap dialog offers only "from here on" | **not started** (Fanta's session is not open) | **OUT**, and it is not in the tree. Does not gate 672 |

## ✅ Team B is GREEN for the whole half (updated 2026-10-06, after §C was approved)
- **668 + 669 released.** Withheld earlier only because §C had no approval. Porter recorded the owner's "อนุมัติ" in `COPY-REVIEW`.
- 📌 **672's refusal sentence** (`GROUP_SWAP_NO_SINGLE_SESSION`, `validation.ts:720`, marked `📋 DRAFT`) has **no approval record**.
  - It does **NOT reach a screen**: a validation refusal shows the generic line (`client.ts:48` lifts `details` only for the student-phone issue). Only the raw API and QA see it.
  - It is **not a blocker**. Porter can get it approved in passing.

## For QA (routes first, then screens)
- **672:** `PATCH /api/group-series/{key}/teacher` with `{ to, onDate }` ⇒ **400**, the coach unchanged on EVERY date; with `fromDate` ⇒ OK.
- **667:** archive a no-parent student whose only future booking is PENDING_RESCHEDULE or PAUSED ⇒ **409**; SICK_LEAVE / CANCELLED only ⇒ allowed. The same for the parent archive.
- **665:** People → "นักเรียนที่ยังไม่มีผู้ปกครอง" → per-row "เก็บ" (the confirm names the row) → it leaves the list, and the count drops. Show archived ⇒ it is listed with "คืนสถานะ", and restore brings it back.
- **671:** create a camp week whose coach already has a class at that hour ⇒ the refusal reads `… ครู {ชื่อ} มีคาบแล้ว …` with the space.
- **670:** a finished course's plan ⇒ "คอร์สนี้เรียนครบแล้ว…"; an expired one ⇒ "คอร์สนี้หมดอายุแล้ว…"; ended early ⇒ still "…ถูกยกเลิก…"; the legend shows "ไม่มาเรียน" and cancelled.
- **624:** ECA Manage plan ⇒ a Swap beside **every** teacher; swapping an extra keeps the primary; the title names who goes out; the "to" label reads "ครูคนใหม่"; "from here on" to a never-paid teacher shows the optional rate field (blank ⇒ `RATE_REQUIRED`, filled ⇒ OK). On a GROUP there is no extra-teacher Swap.
- **668 + 669** (only if they ride): People → no-parent list → "ผูกผู้ปกครอง" → the confirm lists the family's children by name and the upcoming sessions → Link ⇒ the row leaves. API `POST /api/students/{id}/parent` on a child that already has a parent ⇒ 409.

## Release-note flags (Porter words them)
- **672 — Porter's line, VERBATIM (do not reword; factual errors go back to Porter):**
> 🔴 **การสลับครูในคลาสกลุ่ม — แก้ของที่ทำงานผิดอยู่ ไม่ใช่ของใหม่**
> ก่อนหน้านี้ ถ้าเลือก **"ครั้งนี้ครั้งเดียว"** บนคลาสกลุ่ม ระบบจะสลับครู**ทั้งซีรีส์ตั้งแต่วันนั้นเป็นต้นไป** และใช้ค่าสอนของครั้งเดียวเป็นค่าสอนถาวร
> ⇒ **แอดมินที่เคยกดแบบนี้ ได้ผลไม่ตรงกับที่ตั้งใจ และค่าสอนครูอาจถูกตั้งผิดมาตั้งแต่วันนั้น**
> ตอนนี้ระบบปฏิเสธการสลับครั้งเดียวบนคลาสกลุ่มแล้ว
> ▶️ **แนะนำให้ทีมตรวจย้อนว่าเคยกดแบบนี้บนคลาสกลุ่มหรือไม่ ถ้าเคย ให้ตรวจค่าสอนของครูในคลาสนั้น**
  - Finding the affected rows: nothing in TASK-672's work does it today. If wanted, it is a read-only DATA REQUEST (SA designs it, the owner runs it), not a change.
- **668+669:** from the next event on, a linked family's LINE receives notices for that child (expected; no notice at the moment of linking).
- **670 (5a):** pre-existing since `3f19d60` (2026-08-25).
