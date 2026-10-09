# TEST-089 — REQ-116 reproduced on sid, before TASK-707 (old front `f60d7e7`)

**Tester:** Tanya (QA) · **Date:** 2026-10-08 · **Env:** sid (som.develyst.online), admin, headless browser driving the REAL edit dialog
**Brief:** `inbox/QA.md` → "🔁 CHANGE OF PLAN (owner): reproduce on sid FIRST" · **Requirement:** `requirements/REQ-116-camp-add-coach-false-clash-and-time-refusal.md`
**Part 1 verdict: ✅ REPRODUCED, all three (S1, S2, silent harm).** **Part 2 verdict (front `2db1c57`, 707): ✅ PASS, 4/4.** See Part 2 at the end.

## Fixture (QA only)
- Camp week **"QA-116 repro"** `f17d1a7d-f7b1-410f-a429-957211f7f07d`, 26–27 Oct 2026, day window 10:00–15:00.
- **27/Oct (Khwan's day):** QACT on the day's window · **qatt75b own hours 10:00–12:00** · QADT2 on the day's window. qatt75b holds a private class at **13:00** that day (QA course `adedd6a2`, QAChatTwo, SURFSKATE, Tuesdays 27/10–17/11 13:00).
- **26/Oct (no class for the own-hours coach):** QACT · **qatt75 own hours 10:00–12:00** · QADT2.
- Coach D = QADT3. (Coach "A" is qatt75b on 27/Oct and qatt75 on 26/Oct, because qatt75b already teaches 10:00 on Mon 26/Oct.)

## Results

| # | Action in the dialog | Request the old front sent | Server answer | Result |
|---|---|---|---|---|
| S1 | 27/Oct: add **QADT3**, Save | `teachers:[{QACT},{qatt75b},{QADT2},{QADT3}]`. **No times for qatt75b**, though he showed 10:00–12:00 | 409 `SLOT_TAKEN` **"วันที่ 2026-10-27 13:00 ครู qatt75b มีคาบแล้ว — ไม่ได้บันทึกอะไร"** | ✅ reproduced: it names the coach whose hours are 10–12 and cites 13:00, the same as Khwan's Bank/Kowjoe screen. Nothing saved. |
| S2 | 26/Oct: QACT From 10:00 → **13:00** (To stays 15:00), Save | `{teacherId:QACT, startTime:"13:00"}`, **no endTime** (15:00 was unchanged, so it was dropped) | 400 `VALIDATION` **"ครูที่ตั้งเวลาเองต้องระบุทั้งเวลาเริ่มและเวลาจบ"** | ✅ reproduced: both boxes were filled on screen. Nothing saved. |
| Harm | 26/Oct: add **QADT3**, Save | Same shape as S1: no times for qatt75 | **200, success toast, dialog closes** | ✅ reproduced. **qatt75 was silently reset 10:00–12:00 → 10:00–15:00** (server read-back below). |

Server read-back after the harm save: `2026-10-26 | QACT 10:00-15:00 · qatt75 10:00-15:00 · QADT3 10:00-15:00 · QADT2 10:00-15:00`. Before the save it was `qatt75 10:00-12:00`.

**What the requests show (an observation, not a cause ruling; the cause is the SA's):** on Save, the old front leaves out any coach time equal to what it loaded. A coach with his own hours (10–12) is therefore sent with no times, and the server applies the day's window (10–15) to him. That gives S1's clash at 13:00, and the harm when he has no class. A one-sided change (13:00 with 15:00 unchanged) is sent as half a window, which gives S2.

## State left on sid
- Day 26/Oct restored by API to the starting state (QACT · qatt75 10:00–12:00 · QADT2; QADT3 removed). Day 27/Oct is unchanged, since S1 saved nothing. **The fixture is ready for Part 2 after 707.**
- QA course `adedd6a2` stays (it is the 13:00 class S1 needs).

## Evidence — `project-docs/qa-2026-10-08/req116/`
`sid-look.png` (dialog as opened) · `sid-s1-before/after.png` (the refusal banner) · `sid-s2-before/after.png` · `sid-harm-before/after.png`.

## Side note — uat, read-only, before the park arrived
Before Porter's change of plan reached me I had already done one GET-only read on uat: `GET /camp/weeks` + `/days`, 0 writes, with every non-GET blocked at the browser. The data is in the same folder (`days-*.json`).
- **"12-16 Oct" (OPEN, `cc027c4f`):** every day 12–16 has **0 coaches**, window 10:00–15:00, **all five days marked edited**, `editedAt` 2026-10-08 06:27:53–06:27:58 UTC (13:27 Bangkok, one save, one second per day). Kids per day: 5/3/2/2/2.
- "12 -16 Oct" (CLOSED) and "12-13 Oct" (CLOSED): 0 coaches, not edited.
- No screen was opened on uat. The uat look stays parked.

---
# Part 2: after TASK-707 (front `2db1c57`, back `a2185b2`), same fixture, same steps
**Build identity:** the request itself. On S1 the front now sends the untouched own-hours coach WITH both times (`{qatt75b, startTime:"10:00", endTime:"12:00"}`). Part 1's old front sent him bare. That is 707's `teacherEntry`, so the 707 build is what runs on sid. (I didn't capture a chunk name.)

| # | Action (same as Part 1) | Request sent | Server | Read-back | Result |
|---|---|---|---|---|---|
| S1 | 27/Oct: add QADT3, Save | `qatt75b 10:00–12:00` sent whole; QACT, QADT2, QADT3 bare | **200**, dialog closed | `QACT 10–15 · QADT3 10–15 · qatt75b 10–12 · QADT2 10–15` | ✅ saves; qatt75b **keeps 10–12**; no false clash with his 13:00 class |
| S2 | 26/Oct: QACT From 10→13, To left at 15, Save | `QACT 13:00–15:00` (both), `qatt75 10:00–12:00` (both), QADT2 bare | **200** | `qatt75 10–12 · QADT2 10–15 · QACT 13–15` | ✅ saves; no "both times" refusal |
| Harm | 26/Oct: add QADT3, Save | own-hours coaches sent whole (qatt75 10–12, QACT 13–15) | **200** | `qatt75 10–12 · QADT3 10–15 · QADT2 10–15 · QACT 13–15` | ✅ **nobody's hours changed** |
| Day hours | 26/Oct: day Window end 15→14 only, Save | `{"endTime":"14:00"}` only, no `teachers` | **200** | day `10–14` · `qatt75 10–12 · QADT3 10–14 · QADT2 10–14 · QACT 13–15` | ✅ day-default coaches moved to 10–14; own-hours coaches untouched |

🟡 **Observation, not a FAIL (for the SA/owner to rule):** after the day-hours step, **QACT's own 13:00–15:00 now runs past the day's new end (14:00)**. The server accepted it and the dialog gave no warning. The brief asked exactly for "leaves the own-hours ones alone", and that is what happened. Whether a coach's own hours may sit outside the day's window is a product question.

**State left on sid:** both days restored by API to the Part 1 starting state (26/Oct: QACT · qatt75 10–12 · QADT2; 27/Oct: QACT · qatt75b 10–12 · QADT2; window 10–15). QA course `adedd6a2` stays.
**Evidence:** `project-docs/qa-2026-10-08/req116/sid707-{look,s1,s2,harm,dayhrs}-{before,after}.png`.
