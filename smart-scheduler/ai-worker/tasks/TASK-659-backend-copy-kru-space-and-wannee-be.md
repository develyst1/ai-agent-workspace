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
