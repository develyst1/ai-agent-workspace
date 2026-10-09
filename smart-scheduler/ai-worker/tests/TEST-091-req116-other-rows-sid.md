# TEST-091 — REQ-116: do PENDING "Other" rows block adding a coach to the camp day, and does cancelling them unblock it? (sid, front 707)

**Tester:** Tanya (QA) · **Date:** 2026-10-08 · **Env:** sid, admin, headless, the REAL camp dialog and the REAL calendar cancel flow · front `2db1c57` · back `a2185b2`
**Brief:** `inbox/QA.md` → "▶️ One more on SID, under the reproduce-first rule" · **Context:** `tests/TEST-090-uat-706-707-readonly.md` (28 PENDING "Balance Camp 12-16 Oct" OTHER rows on uat)
**Verdict: ✅ both halves proven.** The PENDING Other rows **do block** adding the coach. **Cancelling them unblocks it:** the coach saves, and the camp block appears on his column. **CANCELLED rows block nothing.**

## Fixture (QA only), Khwan's state rebuilt
- Camp week **"QA-091 other-rows"** `39ccb0a9-8496-48b5-bf04-cc449d616cba`, one day, **Wed 28 Oct 2026**, window 10:00–15:00, no coaches.
- Coach **A = QADT3**, with no other rows that day. Two **PENDING `OTHER`** bookings titled "Balance Camp QA-091", **10:00–11:00** `85d74241` and **11:00–12:00** `3ac66ddb`, with no camp link. This matches her 1-hour rows.

## Results

| # | Step | What happened | Result |
|---|---|---|---|
| 2 | Camp → Edit → 28/Oct: add **QADT3**, own hours **10:00–12:00**, Save | Request `teachers:[{QADT3, 10:00–12:00}]` ⇒ **409 `SLOT_TAKEN`**, banner **"วันที่ 2026-10-28 10:00 ครู QADT3 มีคาบแล้ว — ไม่ได้บันทึกอะไร"**. Nothing saved (camp day still has no coaches). | ✅ **blocked**: the refusal is TRUE and names the right coach and the right hour |
| 3a | Calendar → Daily 28 Oct → click each row → **More actions → Cancel booking** → pick a reason → **Cancel booking** | Dialog: "Cancel this booking? … Reason *: Customer changed activity / Customer no longer wants it / Admin entered it by mistake · Note (optional)". The confirm needs a reason. Each row ⇒ `PATCH /bookings/:id/status {action:"cancel", reasonCode}` ⇒ **200 CANCELLED**. | ✅ the admin's own UI path works, 2 rows = 2 cancels |
| 3b | Camp → Edit → 28/Oct: add **QADT3** 10:00–12:00 again, Save | Same request ⇒ **200**; dialog closes; server read-back **QADT3 10:00–12:00** | ✅ **saves** |
| 3c | Schedule → Daily → 28 Oct | **Camp block on QADT3's column: "QA-091 other-rows · CAMP · 10:00–12:00 · 2 h · 0 kids"**; the two cancelled rows are not drawn | ✅ block on the right column |
| 4 | Does a CANCELLED Other row block? | Step 3b saved with only the two CANCELLED rows sitting in 10:00–12:00 | ✅ **No**: Khwan's 16 cancelled rows block nothing |

## For Porter's message to Khwan (facts only, the wording is Porter's)
- The order works: **cancel the PENDING "Balance Camp 12-16 Oct" Other rows first, then add the coaches to the camp week.** Each row is cancelled on its own: open the booking → «More actions» → «Cancel booking» → choose a reason → confirm. On uat that is **28 rows**. (I picked the first reason, "Customer changed activity"; "Admin entered it by mistake" may describe her case better. Which one to suggest is Porter's call.)
- A coach whose Other row is NOT cancelled will be refused with a true "ครู X มีคาบแล้ว" naming that coach and the first clashing hour.
- Cancelling an Other row has no student, so I saw no family message attached to it. The cancel dialog showed no revenue band for these rows.

## State left on sid
Camp week "QA-091 other-rows" with QADT3 10–12 on 28 Oct, and the two Other rows CANCELLED. All QA; left as evidence.

## Evidence — `project-docs/qa-2026-10-08/test091/`
`add1-before.png` / `add1-after.png` (the refusal) · `panel.png` (booking panel) · `cancel-1-dialog.png` / `cancel-2-dialog.png` · `add2-before.png` · `daily-28oct-camp-block.png` (block on QADT3's column).
