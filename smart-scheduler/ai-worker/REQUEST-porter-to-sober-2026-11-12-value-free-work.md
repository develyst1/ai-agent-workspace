# REQUEST 2026-11-12 · Porter → Sober: size the FREE work in days (for a "value + 100% discount" line)
Owner, verbatim (2026-11-12 ~08:40): *"ฝากนายไปตีมูลค่างานที่เราทำให้ฟรีด้วยนะ … เราจะต้องบอกว่ามูลค่ามันคือเท่าไหร่และเราให้ลด discount 100%"*.
Rate: 263 ฿/d (the old rate, BRIEF-owner-backoffice-money-meeting-2026-10-27 §1). Porter turns days into baht; you give **days only**, one line each, with the source (CHECK, banner, TASK) or "SA estimate".

Size each item on the "ทำให้ฟรี" list of `deliverables/SOM-proposal-extra-work-2026-11-11.html` (lines 72–76):
1. Make-up leave: class moves to the next week, not back to the same day (front office). Was it a defect of ours or new behaviour? Say which.
2. Pending course: no parent notice until Confirm Course, then one schedule (front office). Defect or new? Say which.
3. SOM Dashboard: Gender/Nationality base + activity-by-package (SPEC-104 ≈ 1.25–1.5 d BE; anything else?).
4. Back office from the GR-web feedback, rounds 1–7 (theme, Unlock, Merit CEO-only, name, revenue pages, commission-group Edit, alignment on all pages, Add Demo …): the real-code size from GR-FEEDBACK-TO-CODE.md, minus anything already inside the 149-day back-office package.
5. The 7 items พี่ฟีน asked for (LIST-2026-11-12-gr-web-proposed-items.md banners: 1.5 · ? · 1 · 0.5–1 · 0.5 · 0.5–1 · ?): fill the two blanks (Conversion Total+filters, Report Revenue+Conversion).

Write the answer under `## Answer` in this file, then one line in inbox/PM.md. Needed tonight (the owner sends it to แนท).

## Answer
**Sober (SA, Team A), 2026-11-12. Days only, one engineer, QA excluded. "SA estimate" = my judgement, not a seat's ruling.**

1. **Make-up leave → next week: 0.5 d.** Source: CHECK-2026-11-09-frontoffice-intake § F5 · TASK-946. **Our defect.** Our own rule TASK-551 ("same slot = nothing changed") produced it. Owner, 2026-11-10: *"แก้สิ เราทำไม่ถูก"*.
2. **Pending course, no parent message until Confirm Course: 1–1.5 d.** Source: CHECK § F2 · TASK-947. **Our defect** [SA view]: our make-up confirm (REQ-115, born CONFIRMED) also messaged the parent while the course was pending. Nobody ever asked for that message. Owner, 2026-11-10: *"แก้ให้ถูกอ่ะ"*.
3. **SOM Dashboard, Gender/Nationality base + activity by package: 1.25–1.5 d BE.** Source: SPEC-104 § Size · TASK-950. **Nothing else of ours:** Palm built the front end (TASK-950 l.2). It is a change to her dashboard per ขวัญ's feedback (REQ-5009), not part of the 149 d back office.
4. **Back office from GR rounds 1–7, in real BB+BF code: ≈ 8–9.5 d.** SA estimate per GR-FEEDBACK-TO-CODE row:
   - theme white/orange + active menu (#1, #10) 0.5
   - brand "SOM BACK OFFICE" + collapsible menu groups (#11, #24) 0.5
   - CEO Unlock (#2) 1
   - Merit CEO-only (#13) 0.5
   - Revenue Summary category box + Unit (#23) 0.75
   - commission-group Edit (#27) 0.5–0.75
   - 16-point labels/layout (#22) 1–1.5
   - alignment on every page (#28) 1–1.5
   - product image + group dropdown (#25) 1
   - Add Demo (CHECK-2026-11-11 Q3) 0.5
   - revenue re-tag on activity change (#6) 0.5
   - bonus start date (#7) 0.25–0.5

   **Minus the 149 d:** I count none of it inside. The 149 d priced the pages to the old spec, and each row above changes or adds to an already-priced page [SA judgement; the 149 d brief has no line-level list to subtract from].
   **Left out on purpose:**
   - per-menu permissions (#12, #21, #26): a paid option;
   - front-office F1/F4 (#14, #17): paid; F2/F5 are items 1 and 2;
   - park fee (#9, TASK-942).
5. **The 7 items พี่ฟีน asked for, the two blanks:**
   - **Conversion Total + filters: 0.5–1 d** (SA estimate: a BB sum + period/coach filter query + BF).
   - **Report Revenue + Conversion: 1–1.5 d** (SA estimate: a new Excel report in All Report that joins two sources).
   - **Whole item:** 1.5 + (0.5–1) + 1 + (0.5–1) + 0.5 + (0.5–1) + (1–1.5) = **5.5–7.5 d**.
   - ⚠️ #1 Payment Setting Edit (1.5) overlaps the commission-group Edit in item 4 (#27). Count that 0.5 once, so the net is **≈ 5–7 d**.

**Grand total ≈ 16–20 d** (0.5 + 1–1.5 + 1.25–1.5 + 8–9.5 + 5–7).
