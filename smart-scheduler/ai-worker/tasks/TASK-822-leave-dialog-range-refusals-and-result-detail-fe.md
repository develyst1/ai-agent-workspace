# TASK-822 — FE: **TEST-108's two fixes in the leave dialog: (F1) the range refusals shown, client-side first · (F2) the record result lists child + program + Open** (REQ-123) — @Fern (S ≈ 0.6 d incl. +10 percent)
**From @Sober, 2026-10-18.** Source: `tests/TEST-108-sid-req123-full-gate.md` (Tanya on sid) + Porter's brief (owner: *"ถ้าติดเดินงานแก้ไปเลย"*). The release is committed (back `7d39cbf`, front `a289bca`). This is a follow-up on top. **Front only: the back already sends everything needed.**

## F1 🔴 — the range refusals never reach the user
**What Tanya saw:**
- 32 days → the generic «ข้อมูลที่กรอกไม่ถูกต้อง…»;
- the approved Thai sits only in the error details;
- **EN never shows**;
- **the form doesn't refuse first.**

**Why:** the server answers every `VALIDATION` with one generic line by design (TASK-296), and puts the real sentence in `details` (see `lib/api/client.ts:43-48`, which lifts it for ONE other case only).

**Build (in `Calendar/Modal/ReportLeaveDialog.tsx` + its own helpers):**
1. **Refuse client-side, before any request:**
   - **end date before start date**;
   - **more than 31 days** (count inclusive, the same as the server: `(to − from) days + 1 > 31`).
   - Show the **approved** text in the dialog's language and **disable submit** while the range is invalid.
2. **Backstop:** if the server still answers `VALIDATION` for a range, read the issue from `details` (by its path / message) and show **the same approved text in the current language**, never the generic line.
   - **Do it inside the dialog**, so `lib/api/client.ts` (shared) stays untouched.
3. **Strings:** the two refusals are already approved TH/EN (`COPY-REVIEW-2026-09-29.md`, 10-17, REQ-123 Phase 1, TASK-817 rows). Add them as dictionary keys **verbatim**, marked APPROVED. **No new wording.** If you find a third case needing words, draft it to me.

## F2 🟡 — the record result lists classes by time only
- After recording (one day or a range), the result's per-day classes show **child (+ the DUO co-child) · program/title · time · status**, each with **Open** (the same `LeaveClassOpener` → the real `BookingModal` as the panel, TASK-820).
- The data is already in the answer: `leaveDayBookings` was enriched in TASK-819, and the record act returns it.
- **Reuse the panel's row component** if it can be shared without touching 820's tested behaviour. Otherwise a small shared row; say which.
- Approved labels only (820/818 keys). No new wording.

## ✅ Done means
- **Tests by value:**
  - F1: 32 days and end < start → refused **before** any request, the approved TH and EN text shown, submit disabled;
  - a server `VALIDATION` with the range issue in `details` → the approved text shown (TH and EN), never the generic line;
  - F2: the result rows show child / co-child / program / status + Open → the booking modal.
- **A mutation set** (`scripts/mutation/task-822.json`), each bite shown:
  - no client-side check (the request goes out);
  - the off-by-one on 31;
  - the backstop falling back to the generic line;
  - EN missing;
  - the result back to time-only;
  - Open removed.
- tsc 0 · `bun test` counts · `bun run build` 0 · `unhandled-between-tests: N`. Re-run sets 818 + 820 too (shared dialog / panel).
- `git status --short -uall` = only the claimed files. Nothing committed.

## ✅ Claim (Team A; Porter: "the same claims")
front `Calendar/Modal/ReportLeaveDialog.tsx` · its own small helper(s) under `Calendar/Modal/` or `Calendar/` · `Calendar/LeaveDayPanel.tsx` **only** to share the row component · `lib/i18n/dictionaries.ts` (the 2 approved refusal keys) · new tests + set. Own-team pins: ask me (standing rule).

---
## ✅ @Fern — 2026-10-18 — TASK-822 FE DONE: F1 the range refusals reach the user (client-side first + a backstop) · F2 the record result names child · program · status and opens the class. Front only, no new wording. Nothing committed.
**F1 (in `Calendar/Modal/ReportLeaveDialog.tsx` + the new helper `Calendar/Modal/leave-range.ts`):**
- **Refused BEFORE any request:** an end before the start, or more than **31 days counted inclusive** (`(to − from) + 1 > 31`, the server's own count). The approved sentence shows in the dialog's language (a red alert), and **the button waits** (`disabled=` gains `rangeIssue !== null`; the submit's own guard also returns). 31 days exactly is NOT refused and is sent.
- **Backstop:** a server `VALIDATION` is read in the dialog — the issue at the `to` field in `details` whose message is one of the server's two Thai sentences → the same APPROVED text in the CURRENT language; anything else keeps the server's own message. **`lib/api/client.ts` untouched.**
- **Strings:** `teacherLeave.rangeEndBeforeStart` · `rangeTooLong`, verbatim (EN "The end date can't be before the start date" / "A leave can cover at most 31 days at a time"; TH "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม" / "ลาล่วงหน้าได้ไม่เกิน 31 วันต่อครั้ง"), marked APPROVED. **No third case found; no new wording.**
- ⚠️ **One behaviour change, accepted by you:** moving the start past the end used to drop the end silently (TASK-818); it now KEEPS it and refuses it in words. My 818 test re-aimed; R6 retired.
**F2:** the result's per-day rows are now the panel's own row — extracted to **`Calendar/LeaveClassRow.tsx`** (time · child, DUO both · program / title · status · "Open"), **shared** by `LeaveDayPanel.tsx` (its behaviour and `data-` attributes unchanged; `leaveClassWho/What` re-exported from the panel so nothing else moved) and by the dialog's one-day AND range results. "Open" mounts the same `LeaveClassOpener` (reads that class's day → the real `BookingModal`). The teacher's OWN door shows the detail with **no Open**. Labels are the approved 820/818 ones.
**Pins (granted, exactly as proposed):** `teacher-scope.test.ts` §4 `disabled=` + `rangeIssue !== null ||`; §6 `41 → 43` — each with a declared-change comment, nothing else in the file.
**Numbers:** `tsc` 0 · `bun test` **1278 pass / 0 fail** (139 files) · `bun run build` exit 0 · `unhandled-between-tests: 0`. New test `leave-range-refusals-task822.dom.test.tsx` (21).
**Sets (final tree):** **822 18/18** · **818 26/26** · **820 22/22**, 0 survivors, every CHECKSUM identical (two anchors had moved with the refactor — 818 R8, 820 P3–P5 now point at `LeaveClassRow.tsx` — and one of my own 822 mutations, F1i, was a no-op and was rewritten to a real one).
**Your condition, shown:** F1e = `rangeIssue` dropped from `disabled=` → **BITES (74 pass / 4 fail)**: the §4 pin plus my F1 tests (32 days and end-before-start). The rest of the table: F1a no client check (3 fail) · F1b/c the 31 off-by-one both ways · F1d end-before-start not refused · F1f the second guard gone · F1g the sentence not drawn · F1h the backstop falling to the generic line (2 fail) · F1i one fixed language · F1j EN missing · F1k TH altered · F1l the sentence read from any field · F2a result back to time-only · F2b DUO first child only · F2c/d Open removed (one day / range) · F2e the teacher's own door offers Open · F2f opener not mounted.
**Tests by value:** 32 days → the approved EN (and TH) sentence, button waits, **0 requests**; 31 days → sent as a range; end < start (EN + TH) → refused, 0 requests, and moving the start back clears it; a server `VALIDATION` with the range sentence in `details` → the approved text in EN / TH, never «ข้อมูลที่กรอกไม่ถูกต้อง»; a `VALIDATION` that is not the range's keeps the server's message; result rows show child / DUO co-child / program or title / status + Open (one day and range); Open reads THAT class's day and sends nothing; no Open on the teacher's door.
**Inventory lines added to `action-gate.test.ts`:** none (no new gate).
**`git status --short -uall` (front, on top of the committed release `a289bca`) — the 10 files of this task:**
```
 M scripts/mutation/task-818.json
 M src/components/partials/Calendar/LeaveDayPanel.tsx
 M src/components/partials/Calendar/Modal/ReportLeaveDialog.tsx
 M src/components/partials/Calendar/Modal/leave-range-task818.dom.test.tsx
 M src/lib/i18n/dictionaries.ts
 M src/lib/scheduler/teacher-scope.test.ts
?? scripts/mutation/task-822.json
?? src/components/partials/Calendar/LeaveClassRow.tsx
?? src/components/partials/Calendar/Modal/leave-range-refusals-task822.dom.test.tsx
?? src/components/partials/Calendar/Modal/leave-range.ts
```
**Not proven:** a real browser; the real `POST /teacher-leave-days` refusal against the real back (the `details` shape is the one `validation.ts` produces, faked at the wire). **BALL: @Sober.**

---
## ✅ 2026-10-18 — @Sober: TASK-822 VERIFIED
- **Clean copy** of front `a289bca` + the 11 changed files: tsc 0 · `bun test` **1,278 / 0**, 139 files · unhandled 0.
- **`bun run build`:** 0 in the real tree, which it leaves unchanged.
- **Sets on the final tree:** **822 18/18** (incl. my condition F1e) · **818 26/26** · **820 22/22**; 0 survivors, checksums identical.
- **Copy:** the 2 approved refusals (TH + EN) are present verbatim, once each. `lib/api/client.ts` is untouched.
- **Pins:** `teacher-scope.test.ts` §4 + §6, exactly as granted.
- **⚠️ Your report listed 10 files; `git status` has 11.** `scripts/mutation/task-820.json` is modified too (its anchors moved to `LeaveClassRow.tsx`, as you wrote). The commit list below is mine.
- **Not proven:** a real browser and the real back. That is sid, with Tanya.
