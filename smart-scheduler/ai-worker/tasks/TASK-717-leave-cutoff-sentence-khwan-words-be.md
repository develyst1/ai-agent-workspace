# TASK-717 — BE: **the leave cut-off refusal in Khwan's words, the number from the SETTING (R147)** — @Jason (XS ≈ 1 h incl. +10 percent) · after 712
**From @Sober to @Jason, 2026-10-11.** Owner APPROVED — `COPY-REVIEW-2026-09-29.md:592` (item 4, house-rule rows: *"R147 her words with the number from the SETTING"*). Source: `COPY-SET-khwan-workbook-2026-10-11.md` row R147.
✅ **Claim (Team A):** back `src/lib/leave-notice.ts` (`leaveNoticeMessage`) + its tests and the pins that quote the old sentence (list them in this task before editing — shared tests have Team B grants).

## The words — VERBATIM, `{cutoffHours}` = the setting (`leave_cutoff_hours_*`, per coach type), never a fixed 1
- **TH:** `ขออภัยค่ะ การลาต้องแจ้งล่วงหน้าอย่างน้อย {cutoffHours} ชม. ก่อนเริ่มคลาส` + line break + `กรณีฉุกเฉิน กรุณาติดต่อแอดมินค่ะ`
- **EN:** `Sorry, absences must be requested at least {cutoffHours} hour(s) before the class starts.` + line break + `For emergencies, please contact Admin.`
📌 Her sentence drops today's *"this one starts at {time}"* — the `startTime` argument becomes unused; keep the signature or remove it, say which. **Both doors read the same function:** the parent's «ลา» in LINE and the calendar's `LEAVE_NOTICE_TOO_LATE` refusal (Thai).

## ✅ Done means
- **Reproduce first:** a test asserting the new TH/EN by value fails today.
- By value: TH and EN exact with `cutoffHours` = 1, 3 and 24 · the calendar refusal carries the TH · the LINE reply carries the reader's language.
- `tsc` 0 · suite DB-unreachable, every setting blanked · **counts** · `unhandled-between-tests: 0`.
- **Mutations:** a fixed `1` instead of the setting · the line break lost · EN served to a TH reader.
**Then:** my verification → owner commit → rides the next back release. No git.

---
## 📋 2026-10-11 — @Jason: FILE LIST for 717 (written BEFORE the first edit)
**Source:** `src/lib/leave-notice.ts` only (`leaveNoticeMessage`; signature KEPT — the `startTime` parameter stays, renamed `_startTime`, so both callers (`scheduler.service.ts` ×2, `line-webhook.service.ts`) and `leave-window-req085.test.ts:215`'s source pin stay untouched; **Bob's open 727 files — `line-webhook.service.ts`, `line-i18n.ts`, `line-message.ts`, `camp-deduction.ts` — are NOT touched**).
**Existing test I must edit (the ONLY pin that quotes the old sentence — checked by grep for both languages):** `src/lib/leave-notice.test.ts` (lines ≈ 52–58: the old TH/EN sentences). **New:** `src/lib/leave-notice-khwan-words-task717.{test.ts}` + `.mutations.json` is in `src/services/`.

## ✅ 2026-10-11 — @Jason: `TASK-717` (R147) BUILT — the leave cut-off refusal in Khwan's words, the number from the setting — 4 / 4 bite
**FILES: `src/lib/leave-notice.ts` (source) · ONE existing test edited — `src/lib/leave-notice.test.ts` (the only pin that quoted the old sentence, found by grep in both languages; written in the task BEFORE the edit) · NEW `src/services/leave-notice-khwan-words-task717.{test.ts,mutations.json}`.** Bob's 727 files (`line-webhook.service.ts`, `line-i18n.ts`, `line-message.ts`, `camp-deduction.ts`) NOT touched.
**Numbers — clean room (HEAD `8431b33` + my files, since Bob's 727 is open in the shared tree):** `tsc` 0 · suite `4422 pass · 0 fail` · `unhandled-between-tests: 0` · `68 = 68`. **Set `leave-notice-khwan-words-task717.mutations.json` — 4 / 4 BITE** (A fixed `1` instead of the setting · B the Thai line break lost · C EN served to a TH reader · D the English line break lost), CHECKSUM identical; `712` 6/6 re-run, bites.
**Reproduced first:** the new test asserting the approved TH/EN by value — **6 of 7 failed on the old code** (`cutoffHours` 1 / 3 / 24, the TH default, start-time-free, a non-whole hour).
**The change:** `leaveNoticeMessage(cutoffHours, _startTime, lang = "TH")` now returns, verbatim — **TH:** `ขออภัยค่ะ การลาต้องแจ้งล่วงหน้าอย่างน้อย {cutoffHours} ชม. ก่อนเริ่มคลาส` ⏎ `กรณีฉุกเฉิน กรุณาติดต่อแอดมินค่ะ` · **EN:** `Sorry, absences must be requested at least {cutoffHours} hour(s) before the class starts.` ⏎ `For emergencies, please contact Admin.` The number is the argument (the setting, per coach type) — nothing fixed. **Signature kept:** the `startTime` parameter stays, renamed `_startTime` and ignored, so BOTH doors and every pin on them are untouched (`scheduler.service.ts` ×2 → Thai, `line-webhook.service.ts` → the reader's language; pinned by source). The old "this one starts at {time}" is gone, as her sentence has none.
**Pin re-aimed (text only):** `leave-notice.test.ts` AC-7 — it asserted the old sentences; it now asserts the setting's number in each language (and the default is TH), and points to the new file for the exact bytes. Nothing else quoted the old text.
▶️ **Ball: Sober — verify 717 → owner commit → rides the next back release. Next for me: 712 §B (the week-level door), then 711 after "727 landed".**

