# TEST-096 — the combined regression pass on sid, FINAL front-office build (back `d32bdc4` · front `0730275`), no phone

**Tester:** Tanya (QA) · **Date:** 2026-10-12, 00:45–01:30 · **Env:** sid, admin + `qa-coach-qatt75` + `qa-norate-076`, headless, API and the real screens · **Brief:** `inbox/QA.md` → "ONE combined regression pass … `tests/TEST-096-sid-final-front-regression.md`"
**Verdict: ✅ PASS on every item, re-run on THIS build** (not carried over from earlier builds), using my existing recipes on fresh QA rows (Feb–Mar 2027 slots, so nothing collides with earlier fixtures). The LINE half lives in `TEST-095` (part A ✅, B1–B4 ✅); **B5/B6 wait for the owner** (his old-code message). Two family reads are queued for that session (706 below, plus TEST-095 B5).

| Item | Re-run on `d32bdc4`/`0730275` | Result |
|---|---|---|
| **710** same-slot make-up | course `458f6b42` (QAChatTwo · qatt75b · Tue 16:00 from 02/02/27): leave 09/02 ⇒ make-up 02/03 CONFIRMED ⇒ admin cancel (`ADMIN_ERROR`) ⇒ **replacement in the SAME slot 02/03 16:00, CONFIRMED + marked** (the family side was proven on the phone in TEST-095 A1) | ✅ |
| **711** family told after an Undo | run on this build in TEST-095 §1 (24/11 leave ⇒ Undo) and **read on the phone** (TEST-095 A3: the approved TH, no Coach line, after the make-up's cancel) | ✅ |
| **712** camp own hours inside the day | `p106`: start before ⇒ refused (exact sentence) · end past ⇒ refused · equal ends ⇒ saved · day + coach as a valid pair ⇒ saved · day-only shrink under a stored own-hours coach ⇒ refused naming QACT · nothing written on any refusal; day 26/10 restored. Week door: nothing for it to refuse (as TEST-094: own hours mark the day edited) | ✅ |
| **713** one extra group date | series H1 `674dfc3e` (Mon 18:00, 01/02–08/03/27, 3 seats): cancel 08/02 (`SCHOOL_ISSUE`) ⇒ **ONE extra date 15/03** with all 3 seats CONFIRMED + marked, 0 standalone | ✅ |
| **716** retires at zero seats | the 15/03 extra date: 3 → 2 → 1 live seats ⇒ stays CONFIRMED; the last seat out ⇒ **CANCELLED** | ✅ |
| **717** cut-off sentence | course `f7c5ce29` (today 19:00): setting 24 ⇒ `ขออภัยค่ะ การลาต้องแจ้งล่วงหน้าอย่างน้อย 24 ชม. ก่อนเริ่มคลาส` ⏎ `กรณีฉุกเฉิน กรุณาติดต่อแอดมินค่ะ`; 72 ⇒ the same with 72; **setting restored to 3**. In LINE: R39 (TEST-095 A8) | ✅ |
| **718** labels only | diff = comments only; live JS carries L1 ×3 (EN), L9 (TH) byte for byte; no "DRAFT" text ships | ✅ |
| **719** Undo revives | F1 recipe (series F1b, Thu 18:00, E = 18/03/27) ⇒ Undo ⇒ **E CONFIRMED + seat CONFIRMED**, the leave's make-up 25/03 cancelled · **guard** (series SLOTb, E 20/03/27, an OTHER in the coach's slot) ⇒ `UNDO_SLOT_TAKEN`, preview identical, nothing written. (711 changed `undo.service.ts`, hence the re-run.) | ✅ |
| **725/726** admin LINE ↔ web user | Users page: `qa-norate-076` **LINKED** (since TEST-095 B2), **ENABLED** · LINE links panel: "QA NoRate 076 · qa-norate-076 · id ends …c3da · Also the parent 0899990763 · Remove admin rights" · header «Link LINE» for admin/QA user, **absent for the coach** · no raw LINE id in any payload · old code refused (TEST-095 B3) · notice arrives (B4) | ✅ · B5/B6 ⏸️ |
| **727/728** sample | R62 live on `/register` (new TH/EN present, old absent) · R82/R39/R62 back = her text (TEST-094) · R39 + P14 **live on the phone** (TEST-095 A8/A4) | ✅ |
| 704 D1 | Undo of a leave cancels its CONFIRMED make-up, expiry unmoved (TEST-095 §1 on this build) + the make-up cancel wording read on the phone (A2/A3) | ✅ |
| **705 D4** | course `6f6e0b6e` (QAChatTwo · qatt75 · Mon 17:00, back-dated): make-up **today 12/10** ⇒ `qa-coach-qatt75` own leave today ⇒ `cancelled 1, familiesNotified 1` ⇒ replacement **19/10, not today**, expiry 12/10 ⇒ 19/10 | ✅ |
| **706** PENDING group date, CONFIRMED seat | series P706 `84169efa` (**not** confirmed: rows PENDING), seat course `d3027ffd` (QAChatTwo) CONFIRMED ⇒ admin cancels the PENDING date 12/02/27 ⇒ the seat CANCELLED, make-up 19/03 CONFIRMED + marked | ✅ state · ✅ **family told** (read 02:08: `❌ ยกเลิกคาบเรียน: Date 12-02-2027 …` + CONFIRMED 19-03-2027, TEST-095) |
| **707** camp hours sent whole | the real dialog, 27/10: add QADT3 ⇒ the request carries `qatt75b 10:00–12:00` ⇒ **200, qatt75b keeps 10–12**; fixture restored | ✅ |

## Still open (all LINE-side, all need the owner first)
1. **B5** disabled ⇒ no admin notice · **B6** Unlink ⇒ none (TEST-095). `qa-norate-076` is currently **LINKED and ENABLED**. After B6 it is NOT LINKED again.
2. **706**'s family message (above), read in the same sitting.

## QA data added on sid by this pass
Courses `458f6b42`, `f7c5ce29`, `6f6e0b6e`, the H1 / F1b / SLOTb / P706 series and their seat courses (QA kids only); an OTHER "QA-094 slot holder" 20/03/27 18:00; camp week "QA-096 712 week door" `01b1786f`. Setting `leave_cutoff_hours_fulltime` = 3 (restored).

## ✅ CLOSED 2026-10-12 02:10 — the open items are done
B5 (disabled ⇒ no admin notice) ✅ · B6 (Unlink ⇒ none) ✅ · 706's family message ✅ — details in `TEST-095` (Part B). **TEST-096 + TEST-095: PASS, nothing outstanding.**
