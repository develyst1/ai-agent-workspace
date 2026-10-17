# TASK-736 — P26: the camp FAMILY reminder prints the REAL hours (and her layout) — BE, S (≈ ½ d)
- Source: `COPY-SET-khwan-workbook-2026-10-11.md` row **P26** (`camp_reminder · parent`) · set-1 house rule (times with a COLON) · the hours: the CEO 2026-10-12 · held from TASK-727 until now · Porter GO
- Status: ✅ DONE (set 6/6 in the final 4641/0, log 2026-10-12) · in back `1f82c32`
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-12)
- **Claim:** `src/lib/line-message.ts` (the camp reminder case) · `src/lib/line-i18n.ts` · `src/lib/camp-reminder.ts` (granted to Team B for 727). 🚫 **`camp.service.ts` only if the reminder input does not already carry the half**: then list it and ask (Porter). 🔴 SAFE test command only (TASK-723 has it). 🔴 run → list → ask → THEN edit. Own-team pins: Silver grants (reported); other teams' files + shared inventories: Porter.

## Build
- Her P26 layout (COPY-SET "her text"), with **`Time : {hours}`** from the booking's half, using the SAME fixed map as TASK-735. **FIXED hours (ฟีน, the CEO, 2026-10-12, verbatim in `COPY-DRAFT-khwan-camp-halfday-and-weeks-2026-10-12.md`):** morning `10:00-12:00` · afternoon `13:00-15:00` · all day `10:00-15:00`. **Times print with a COLON** (the set-1 house rule), not her dot. ONE constant map, used by both TASK-735 and TASK-736 (put it in `lib/camp-hours.ts` or beside the camp renderers; decide and declare).
- Her `Camp : Week 1` label shape. Her TH = EN where she wrote one text; otherwise COPY-SET rule 1.
- Today's `ช่วง : ช่วงเช้า` / `Time : Morning (AM)` goes.

## Definition of Done
- [ ] By-value tests: full day / morning / afternoon ⇒ the three times with a COLON; both languages.
- [ ] Mutation: the dot format back · the old "Morning (AM)" back · the half ignored.
- [ ] tsc · full suite (SAFE). Nothing committed.

## Implementation Notes
**Bob, 2026-10-12 — BUILT inside the claim. Nothing committed.**
- NEW `lib/camp-hours.ts`: ONE map for 735 and 736 — `CAMP_HALF_HOURS = { AM: "10:00-12:00", PM: "13:00-15:00", FULL: "10:00-15:00" }` (the CEO, a COLON) and `campHoursOf(half)` (an unknown half ⇒ `undefined` ⇒ the caller omits the line; never a guessed hour). **Declared:** it is its own file (not in `camp.ts`, which holds the week/coach WINDOWS — a different thing: what the family is told is fixed by half).
- `line-message.ts` (the camp reminder, parent branch only): the Time line is `Time : {campHoursOf(r.half)}`; `cp_time` TH is now `Time` (her TH label; EN already `Time`); `line-i18n.ts`'s `cp_half_*` keys are now UNUSED but left (pinned by name in camp-3b; deleting them is a separate clean-up). The reminder input already carries the half (`CampParentRow.half`), so **`camp.service.ts` and `camp-reminder.ts` are NOT touched.**
- Tests: NEW `lib/camp-hours-task736.test.ts` (**8**: her P26 sample for all day / morning, the afternoon, the old words gone and no dot ever, several children each with their own half, an unknown half ⇒ no line, the map) + `.mutations.json` (**6 BITES · 0 SURVIVED**, checksum identical: H1 dot back · H2 old `Morning (AM)` · H3 half ignored · H4 afternoon wrong · H5 unknown guessed · H6 old Thai label). My own 727 test's P26 pin now covers the label only.
- Suite note: the tree currently also holds Team A's uncommitted 0069 (area codes) — **54 reds already in the tree before my change**, none mine (migration-count pins 69 → 70, etc.). I compared failure lists before/after my change: the reds my change adds are exactly those below.

## Questions
1. 🔴 **`src/lib/camp-3b-undo-qr-reminder-req095-3b.test.ts`** (the parent-block test + a source pin): **lines 225, 228** (the expected parent texts with `Time : Morning (AM)` / `Time : Full day` / `ช่วง : ช่วงเช้า` / `ช่วง : เต็มวัน` → `Time : 10:00-12:00` / `Time : 10:00-15:00`), **231–232** (`Time : Afternoon (PM)` / `ช่วง : ช่วงบ่าย` → `Time : 13:00-15:00`), **256** (`cp_time: { TH: "ช่วง", EN: "Time" },` → `cp_time: { TH: "Time", EN: "Time" },`). 5 lines, 2 tests (the "+n rule" test fails only on line 256's source pin). May I edit?

## Review

- **✅ Porter (2026-10-12): GRANTED** `camp-3b-undo-qr-reminder-req095-3b.test.ts` :225, :228, :231-232, :256 (the old "Morning (AM)" pins). ▶️ GO.

**Bob, 2026-10-12 — camp-3b pins APPLIED (granted):** lines 225/228 (the expected parent texts → `Time : 10:00-12:00` / `10:00-15:00`, her TH label `Time :`), 231–232 (the afternoon → `Time : 13:00-15:00`), 256 (`cp_time: { TH: "Time", EN: "Time" }`). Nothing else touched. Set 6/6 BITES, checksum identical.
