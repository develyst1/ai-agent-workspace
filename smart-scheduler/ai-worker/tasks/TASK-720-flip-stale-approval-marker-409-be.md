# TASK-720 — flip Team B's two back-end approval markers (comments only): `STUDENT_ALREADY_HAS_PARENT` + `GROUP_SWAP_NO_SINGLE_SESSION` — BE, XS
- Source: @Porter 2026-10-07 (from @Sober's back-end marker sweep: 24 markers found; this one is Team B's) · Sober's flip rule, adopted by Porter for both teams
- Status: DONE (reviewed by Silver, 2026-10-07) · rides the next deploy
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-07)
- **Claim (Porter, 2026-10-07):** the COMMENT above `STUDENT_ALREADY_HAS_PARENT` in `src/services/parent.service.ts` (~`:283`) and the COMMENT above `GROUP_SWAP_NO_SINGLE_SESSION` in `src/validation.ts` (~`:719`). 🚫 Neither string is touched.
  - Anything red outside ⇒ the standing practice: full suite, the whole list to me once, no edit before the grant.

## What to do
1. **The flip rule (Sober's, adopted by Porter): flip ONLY if the code string equals the approved text byte for byte.** Any mismatch ⇒ STOP and list it to me. Never fix the string.
   - **Approved text:** `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md` §C, row "server refusal: already has a parent (409)", TH. It was approved with all 10 on 2026-10-06 (`COPY-REVIEW-2026-09-29.md`, the §C approval).
   - **Pre-checked by Silver, 2026-10-07: byte-equal (188 = 188 bytes).** Re-check it yourself, from the files.
2. Replace the comment line `📋 DRAFT wording (owner approves with the next copy batch) — …§C.` with an approved line in the file's style, e.g. `✅ APPROVED wording (owner, 2026-10-06, COPY-REVIEW §C approval) — verbatim; do not "improve" it.`

3. **`GROUP_SWAP_NO_SINGLE_SESSION` (`validation.ts`)** (added 2026-10-07):
   - **If `COPY-REVIEW-2026-09-29.md` holds the owner's approval of it** (Porter reports the owner approved it as it stands): byte-compare and flip to `✅ APPROVED by the owner 2026-10-07 — COPY-REVIEW-2026-09-29.md:<line>`.
   - **If there is no record yet:** label it `📋 ENGINEER WORDING — LISTED, NOT APPROVED (owner rule 2026-10-07: a refusal no screen can reach)` and SAY HOW no screen reaches it. Silver's code path: the front no longer sends `onDate` on a group (TASK-673); and the front lifts VALIDATION `details` ONLY for the student-phone issue (`front src/lib/api/client.ts:47-48`), so the screen shows the generic line.
   - Either label is true. 🚫 Never `APPROVED` without the record line.

## Definition of Done
- [ ] The byte-equality check, shown (the command and its result).
- [ ] `git diff` = those two comment lines only.
- [ ] Full back-end `bun test` with counts (no database). Nothing committed.

## Implementation Notes
**Bob, 2026-10-07.**

**Byte-equality, checked from the files (not from Silver's pre-check)** — a script reads the approved text out of the record and the string out of the source, and compares the raw bytes:
```
1) STUDENT_ALREADY_HAS_PARENT   (parent.service.ts)   vs COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md §C, row "server refusal: already has a parent (409)", TH
   approved: "นักเรียนคนนี้ผูกกับผู้ปกครองแล้ว — รีเฟรชหน้าเพื่อดูข้อมูลล่าสุด"  188 bytes
   code    : "นักเรียนคนนี้ผูกกับผู้ปกครองแล้ว — รีเฟรชหน้าเพื่อดูข้อมูลล่าสุด"  188 bytes     BYTE-EQUAL: true
2) GROUP_SWAP_NO_SINGLE_SESSION (validation.ts)       vs COPY-REVIEW-2026-09-29.md:561 (owner approval, recorded 2026-10-07), TH
   approved: "กลุ่มเปลี่ยนครูได้เฉพาะ 'ตั้งแต่วันที่…' เท่านั้น — ไม่มีการสอนแทนคาบเดียว"  210 bytes
   code    : "กลุ่มเปลี่ยนครูได้เฉพาะ 'ตั้งแต่วันที่…' เท่านั้น — ไม่มีการสอนแทนคาบเดียว"  210 bytes   BYTE-EQUAL: true
```
- (2) is the step-3 case with a record, so it gets `APPROVED` plus the record line. The record is real: `COPY-REVIEW-2026-09-29.md:560-561`, *"ตามแนะนำ"*, EN none.
- The quotes are a straight `'` and the ellipsis is the single character `…`, and both match. I re-ran both checks **after** the edit: still byte-equal, so no string was touched.

**The two flips (comment lines only):**
- `parent.service.ts:285`: `📋 DRAFT wording (owner approves with the next copy batch) — …§C.` → `✅ APPROVED wording (owner, 2026-10-06, COPY-REVIEW §C approval) — verbatim, byte-equal to …§C; do not "improve" it.`
- `validation.ts:719`: `📋 DRAFT wording (owner approves with the next copy set) — a backstop…` → `✅ APPROVED by the owner 2026-10-07 — COPY-REVIEW-2026-09-29.md:561 — verbatim; do not "improve" it. (A backstop the screen no longer reaches after TASK-673.)`
- Each edit was a script that refuses unless its anchor matches **exactly once**.

**`git diff --stat`: `parent.service.ts` 1 line, `validation.ts` 1 line, +2 / −2. Those two comment lines only.**

**Runs (no database; `.env` untouched):** full suite **4232 pass / 0 fail across 324 files** · `tsc --noEmit` → exit 0. **Nothing red anywhere**, so there is no out-of-claim list to send (the standing practice).
- The tree is otherwise clean: only these two files are modified. Nothing committed.
## Questions

## Review

**Silver, 2026-10-07 — step 3 resolved:** the owner's approval of `GROUP_SWAP_NO_SINGLE_SESSION` is now RECORDED at **`COPY-REVIEW-2026-09-29.md:561`** (Porter; owner "ตามแนะนำ"). I checked by machine that the code string is in the record **verbatim**. ⇒ Use the **APPROVED** label citing `:561` (after your own byte check). The LISTED branch no longer applies.

**Silver, 2026-10-07 — ✅ DONE.**
- The diff is the two comment lines only (+2/−2), with 0 non-comment changes, and the strings are untouched.
- Both labels cite a real record: §C (10-06) and `COPY-REVIEW:561` (10-07). Bob's byte checks: 188 = 188 and 210 = 210.
- **Re-run by me:** the full back suite **4232 / 0**.
- **Files to commit:** `src/services/parent.service.ts`, `src/validation.ts`.
