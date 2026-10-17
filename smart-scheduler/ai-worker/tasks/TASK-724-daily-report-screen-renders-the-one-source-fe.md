# TASK-724 — Daily report screen: render the back's ONE count (no recount from `/calendar`), all type rows + a camp row — FE, S
- Source: as TASK-723 · **REPRODUCED: `tests/TEST-092-daily-report-step0-sid.md`**
- Status: 🚫 **CANCELLED — handed to Palm** (owner 2026-10-11: *"A คือหน้าบ้านทั้งหมดและ เราจะไม่แตะ ฉันฝากให้ปาล์มรับผิดชอบ"*; REQ-117 is not ours). Nothing was built. Kept as a record of the analysis.
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-11) · **ships TOGETHER with TASK-723** (the back's new shape).
- **Claim ✅ GRANTED by Porter 2026-10-11, effective the moment the owner answers Q1:**
  - `src/services/scheduler.service.ts`: `getDailyReport` / `enrichDailyReport` / `BOOKING_TYPES` only (`:1030-1083`);
  - `src/services/scheduler.mock.service.ts`: the daily-report mock only;
  - the Daily report component(s) and their tests;
  - the response type for `/reports/daily`.
  - 🚫 **No dictionary write:** every label exists.
  - Reds outside the claim ⇒ the standing practice.

## §0 Why
- The screen recounts the day from `/calendar` (`enrichDailyReport`, `:1037-1074`), with its own rules. It **disagrees with the back** (TEST-092, 27 Sep: 11 · 9 vs 14 · 11) and counts camp coach-hours as attended (Khwan's 17 vs 9).
- TASK-723 makes the back the one counter. **This TASK stops the second counter.**

## What to build
1. **`getDailyReport` makes ONE call** (`/reports/daily` with `date` and `teacherId`) and renders what it returns. 🚫 **Delete the `/calendar` recount.** No count is computed on the front.
2. **"By booking type": all 6 types**, using the existing labels `bookingType.*` (incl. `OTHER` «อื่นๆ», `GROUP` «คลาสกลุ่ม»).
   - **Plus a camp row** carrying the CHILDREN who came, using the existing `แคมป์` / `Camp` label (decide which existing key and declare it).
   - 🚫 No new words. If a row seems to need a new word (e.g. "children"), STOP and ask me (that is owner copy).
3. **On leave stays its own line and is NOT in Total booked** (R3). The back already returns it that way.
4. **The mock** returns the new shape, including a camp day.

## Definition of Done
- [ ] **Clicked DOM tests, by value**, with a mocked response shaped like TEST-092 30 Sep:
  - Attended **3**, the camp row **7**;
  - every type row is present, GROUP included;
  - **no request to `/calendar`** from the report (pinned at the wire);
  - a coach / `teacherId` passes through to the request.
- [ ] Mutation set:
  - the `/calendar` recount restored (bites);
  - the camp row dropped (bites);
  - GROUP / OTHER rows dropped (bites).
- [ ] tsc · full `bun test` with counts · build. 🚫 No click on sid or uat. Nothing committed.

## QA hand-off
- As TASK-723: 27 Sep ⇒ Attended 4, camp 0 · 30 Sep ⇒ Attended 3, camp 7 · **the screen equals `/reports/daily`**.

## Implementation Notes

## Questions

## Review
