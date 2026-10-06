# TASK-659 — BE: **copy — `ครู {ชื่อ}` with a space (5 sites) · "วันนี้" said about a picked date (2 sentences)** — @Jason, Thu/Fri (XS)
**From @Sober to @Jason.** ⚖️ **Owner APPROVED, 10-06 ("1-5 ตามแนะนำ"): ruling 5 — a space ALWAYS after ครู; the 3b drafts approved as drafted** (`SIZING-teamA-next-round-2026-10-05.md` §3).
✅ **Claim (Team A):** `src/lib/slot-clash.ts` · `src/lib/teacher-leave.ts` · `src/services/scheduler.service.ts` (the three refusal lines only — you hold this file for `TASK-656` anyway) · co-located tests.
🚫 **`src/services/camp.service.ts:284` is the SIXTH site and it is Team B's file (camp).** ⇒ **@Porter routes it to Team B with the same approved rule.** **Do not touch it.**
📌 **Why this is yours, not @Fern's: all seven strings live in back-end files, three of them in the file you are already editing — two people in `scheduler.service.ts` the same week is a collision we can avoid.**

## 1. What changes — verbatim, 🚫 never "improved"
**3a — a space after `ครู`, always (🚫 no helper that decides by script):** `slot-clash.ts:32` · `teacher-leave.ts:58` · `scheduler.service.ts:1028` · `:1030` · `:1038` → `ครู ${name} …`
**3b — two sentences:**
| site | becomes (TH, ships) |
|---|---|
| `scheduler.service.ts:1030` | **`ครู ${teacher.nickname} ไม่ได้สอนวัน${weekdayTh} — กรุณาเลือกครูอื่นหรือวันอื่น`** |
| `teacher-leave.ts:58` (`TEACHER_ON_LEAVE`) | **`ครู ${teacherName} ลาวันที่ ${date} — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น`** |
⚠️ **`{weekdayTh}` is the Thai weekday NAME of the picked date (จันทร์ … อาทิตย์), from the codebase's existing weekday names if one exists — 🚫 do not add a second table; if none exists, STOP and tell me.**

## 2. ✅ Done means
**`tsc` · suite with COUNTS · value pins of all seven strings exactly as above · a grep in the report: no `ครู${` left in your files.** **Mutations: one site without the space (BITES) · "วันนี้" restored in either sentence (BITES).**

## ✅ 2026-10-06 (night) — @Jason: `TASK-659` DONE — five spaces, two «วันนี้» sentences, 8 / 8 bite
**`tsc` 0 · DB-unreachable suite 4164 pass · 1 fail (TASK-667's own mutation set — Team B, not mine) · `66 .sql = 66 journal tags`.** **Set: `src/lib/copy-kru-space-task659.mutations.json` — 8 / 8 BITE**, baseline 35, CHECKSUM identical, test list in the file.
- **3a — a space after `ครู`, five sites, no helper:** `slot-clash.ts` · `teacher-leave.ts` · `scheduler.service.ts` ×3 (archived · not a working day · no freelance budget). **Grep in my three files for `ครู${`: ZERO matches** (also asserted by a test over the CODE, comments excluded).
- **3b — the two sentences, verbatim:** `ครู ${nickname} ไม่ได้สอนวัน{weekdayTh} — กรุณาเลือกครูอื่นหรือวันอื่น` and `ครู ${teacherName} ลาวันที่ ${date} — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น`. **`{weekdayTh}` comes from the codebase's EXISTING weekday names — `ob_dow_0..6` through `t()`, the same ones `line-leave.ts` renders — no second table** (asserted: seven keys, none added; `D3` hard-codes it and bites). By value: Mon 2026-10-12 → «จันทร์» · Wed 10-14 → «พุธ» · Sun 10-18 → «อาทิตย์» (index 0).
- **Pins moved, each to the approved string, not loosened:** `slot-clash.test`, `additional-teacher-clash.test`, `teacher-leave-day-task561.test` ×2, `booking-undo-req108.test` (the Undo's refusal names the coach). The freelance-no-budget string is pinned from the code (its branch needs a database read).
- 🚫 **`camp.service.ts:284` NOT touched** — asserted in the test (it still carries the old spelling until Team B routes the approved rule), so @Porter's routing is visible if it is forgotten.
- Mutations: `S1–S5` each drops ONE site's space and bites ALONE · `D1`/`D2` restore «วันนี้» in either sentence and bite · `D3` hard-coded weekday bites.

▶️ **Ball: Sober verifies 659. Nothing queued behind it on my side except `TASK-639` (after the batch) — and your a/b answer on 657's gate step 3.**
