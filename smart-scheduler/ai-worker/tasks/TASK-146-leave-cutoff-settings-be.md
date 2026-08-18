# TASK-146: Leave cut-off as editable per-type settings (BE)
- Source: SPEC-048 (REQ-047)
- Status: DONE (SA-reviewed Sober) · one small AC-7-on-LINE finish requested (Q1) · Q2 defect-fix ratified · live LINE → @Tanya
- Assignee: @Jason (BE)
- Depends on: coordinate the sick-leave-branch merge with TASK-136 (REQ-049)

## What to do (smart-scheduler-back)
1. **Two number settings** in `lib/settings.ts` `SETTINGS`: `leave_cutoff_hours_fulltime` (covers FULL_TIME
   **and** PART_TIME) and `leave_cutoff_hours_freelance` (FREELANCE), both `type:"number"`, **default 3**,
   `parse: intInRange(0, 72)`.
2. **Add `"hours"` to `SettingSpec.unit`** (`"days"|"minutes"|"option"` → `+ "hours"`); store hours.
3. **Refactor `lib/leave-notice.ts` to a pure comparator** taking a resolved cut-off:
   `hasEnoughLeaveNotice(date, startTime, cutoffHours)` → `minutesUntilClass >= cutoffHours*60`. Keep the
   `>=` boundary (AC-3). It stops owning the constants.
4. **Both enforcement sites** (`scheduler.service.ts:1579-1580` mark-absence · `:1820-1829` sick-leave):
   map `teacher.type` → the key, `await getSetting(key, tx)`, compare. **Keep the read inside the
   `!override` guard** (admin cancels stay exempt — AC-5).
5. **Rewrite `leaveNoticeMessage`** bilingual (TH+EN) with the actual `{n}` and session `{time}` (AC-7):
   - TH `ขออภัยค่ะ ลาได้ล่วงหน้าอย่างน้อย {n} ชั่วโมงก่อนเริ่มคาบ คาบนี้เริ่ม {time} น. หากจำเป็น กรุณาติดต่อแอดมิน`
   - EN `Sorry — leave must be at least {n} hours before the session. This one starts at {time}. Please contact the admin if you need help.`
6. Update `leave-notice.test.ts` (asserts 60/60/120 + old boundaries — will fail on the new defaults).

## Definition of Done
- [ ] 3h-before is refused, 3h+ allowed, exactly-3h allowed (boundary), per the **session's teacher type**. (AC-1/2/3)
- [ ] Changing the setting on the screen takes effect immediately, no deploy/SQL. (AC-4)
- [ ] Admin override still cancels a late session. (AC-5)
- [ ] Both enforcement sites gated (verify LINE leave + plan-editor mark-absence both obey). Recorded leaves untouched. (AC-6)
- [ ] Refusal is TH+EN with the configured `{n}` and `{time}`. (AC-7)
- [ ] `bunx tsc --noEmit` 0 · `bun test` green (updated leave-notice tests + new resolver behaviour).

## Implementation Notes / Questions
(Jason fills in. Same sick-leave block as TASK-136 — sequence/merge.)

## Implementation Notes
**Files:** `lib/settings.ts` (unit `"hours"` + the two rules) · `lib/leave-notice.ts` (rewritten pure) ·
`lib/leave-notice.test.ts` (rewritten) · `lib/settings.test.ts` (registry shape + 3 new tests) ·
`services/scheduler.service.ts` (both enforcement sites) · `services/line-webhook.service.ts` + `lib/line-i18n.ts`
(the refusal actually reaching the parent — see the flag below).

1. **Two settings**, both `type:"number"`, **default 3**, `unit:"hours"`, `intInRange(0, 72)`:
   `leave_cutoff_hours_fulltime` (FULL_TIME **and** PART_TIME) and `leave_cutoff_hours_freelance`. They appear on
   the Settings screen automatically — `SettingsContent` already renders every registered numeric rule, so
   **TASK-147 needs no new component** for these two rows.
2. **`SettingSpec.unit`** gained `"hours"`.
3. **`lib/leave-notice.ts` no longer owns the numbers.** `LEAVE_NOTICE_MINUTES` / `leaveNoticeMinutes` are gone;
   the module now exports `minutesUntilClass`, `hasEnoughLeaveNotice(date, startTime, **cutoffHours**, now?)` —
   `minutesUntilClass >= cutoffHours * 60`, **`>=` kept** (AC-3) — plus `leaveCutoffKey(type)` (the
   FULL_TIME/PART_TIME → fulltime mapping, so neither call site can map it differently) and the rewritten
   `leaveNoticeMessage(cutoffHours, startTime, lang)`.
4. **Both enforcement sites** (`applyPlanChange` mark-absence + `updateBookingStatus` sick-leave) resolve
   `getSetting(leaveCutoffKey(teacher.type), tx)` at action time, **inside the `!override` guard** — so an admin
   cancel neither reads nor obeys the rule (AC-5), and the read joins the booking's transaction.
5. **Refusal copy** is the SPEC's TH/EN with the configured `{n}` and the session `{time}`. It lives in
   `leave-notice.ts` rather than the LINE i18n table, matching `teacher-change-notice.ts` — this string is thrown
   from the service and reaches **both** the web FE (409 body) and LINE.
6. **Tests rewritten** — the old ones asserted the now-deleted 60/60/120 constants. They now pin the boundary at
   the default 3h (2h59 refused · exactly 3h allowed · 4h allowed), that a *different configured value flips the
   answer on identical inputs* (AC-4), the key mapping, a 0-hour cut-off still refusing an already-started class,
   and the TH+EN message text. `settings.test.ts` pins both defaults, the 0–72 bounds, and malformed → 3h.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **498 pass / 0 fail** (64 files; was 493).

🔴 **A defect I hit while checking AC-6/AC-7 on the LINE path — fixed, and I want it looked at.**
`doLeaveBooking` called `updateBookingStatus` with **no catch**, so a refusal (`LEAVE_NOTICE_TOO_LATE`,
`LEAVE_LOCKED`, …) propagated to the webhook's outer handler, which only `console.error`s it — **the parent got
no reply at all.** The bot simply went silent on every refused leave. That makes AC-7 unreachable on the exact
path parents use, so I wrapped the call and reply with the server's message (plus a `leave_err` fallback key,
modelled on the existing `checkin_err`). Success path byte-for-byte unchanged.

## Questions
- Q1: the refusal that reaches a **LINE** parent is currently the service's **TH** string, because
  `updateBookingStatus` doesn't know the caller's language. Full AC-7 bilinguality on that path needs `lang`
  threaded into the service (or the code re-rendered bot-side from `LEAVE_NOTICE_TOO_LATE` + the setting). Both
  are small, but one changes a money-adjacent signature and the other duplicates the copy — **your call**, and
  I'd rather ask than pick. Web/staff FE is unaffected (Thai UI).
- Q2: ratify the silent-refusal fix above (it is beyond the task's 6 items, but AC-7 can't be met without it).
- Q3: `TASK-148` has a board row but **no task file** — I didn't start it. If it was meant to be cut, the file is
  missing; if it's deliberately queued behind REQ-055, ignore this.

  > **answers (Sober 2026-08-18):**
  > **Q1 (LINE refusal language) — render bot-side, don't touch the service signature.** `leaveNoticeMessage` is already
  > exported and takes `lang`, and `doLeaveBooking` already has the parent's `lang` + the booking (date/startTime) + can
  > `getSetting(leaveCutoffKey(teacher.type))`. So in the catch you just added, on `LEAVE_NOTICE_TOO_LATE` **re-render
  > `leaveNoticeMessage(cutoff, startTime, lang)`** in the parent's language — no money-adjacent signature change, no
  > duplicated copy (reuses the exported fn), matches the codebase's "LINE renders bot-side" pattern (TASK-135). Small
  > addition to complete AC-7 on the LINE leg; please add it before commit. Web/staff stays Thai (fine).
  > **Q2 — ratified. Good catch, real defect.** `doLeaveBooking` swallowing the refusal so the bot went *silent* on every
  > refused leave is exactly the kind of thing AC-7 exists to prevent; wrapping it + a `leave_err` fallback is correct.
  > **Q3 — my miss, fixed.** I added the TASK-148/149 board rows + wrote SPEC-049 but never cut the files. **TASK-148 +
  > TASK-149 now exist** (REQ-045 planned-absences-at-creation). Not queued behind REQ-055 — they're live. Thanks for
  > catching the phantom row.

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-18).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **498/0** (5 new). Faithful:
2 settings (`_fulltime` FT+PT / `_freelance`, default 3h, `intInRange(0,72)`, `unit:"hours"`); `leave-notice.ts` now a
pure comparator (`>=` boundary kept, AC-3) + `leaveCutoffKey` so neither site can map the type differently; both
enforcement sites resolve `getSetting(key,tx)` **inside** the `!override` guard (`:1582` mark-absence · `:1831`
sick-leave — AC-5 preserved); message bilingual with `{n}`+`{time}`. Tests pin the boundary + "a different configured
value flips the answer on identical inputs" (AC-4) + malformed→3h. **Verdict: DONE**, with the small Q1 bot-side render
to finish AC-7 on LINE (add before commit). REQ-047 closes on that + @Tanya's dev leave-cutoff check. ⚠️ Same sick-leave
block as TASK-136 — coordinate the commit/merge.
