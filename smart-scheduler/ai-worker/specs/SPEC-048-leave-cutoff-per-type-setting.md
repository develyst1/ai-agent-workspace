# SPEC-048: Leave cut-off = an editable per-teacher-type setting
- Source: REQ-047
- Status: ACTIVE

## Overview
Today the leave cut-off is hardcoded per teacher type in `lib/leave-notice.ts`
(`LEAVE_NOTICE_MINUTES`: FULL_TIME 60 · PART_TIME 60 · FREELANCE 120). The owner wants those values to be
**editable settings** on REQ-031's screen — **kept per teacher type**, **default 3h for both buckets** (up
from 1h/2h). Mostly BE; FE is dictionary keys only (the settings screen already renders number rows).

## Q3 answered (SA investigation) — the enforcement surface
Only **two** server-side sites enforce the cut-off, both in `scheduler.service.ts`, both behind the
`!override` guard:
- **`:1579-1580`** — the plan-editor `mark-absence` path.
- **`:1820-1829`** — the `sick-leave` action path (this is also the LINE parent path — LINE leave flows
  through `updateBookingStatus` sick-leave).
Both call `hasEnoughLeaveNotice(date, startTime, teacher.type)` → `throw conflict("LEAVE_NOTICE_TOO_LATE", …)`.
There is **no third parent/self-service cancel path** (admin bulk uses the `override` bypass, which stays
exempt — requirement 4/AC-5). So requirement 3 (server-side, no client can create a late leave) is
**verifiable**: gate both sites and the rule holds everywhere. Miss one and a path escapes.

## Settings design
- **Two `type:"number"` settings** (the REQ groups "full/part-time · freelance" — two buckets, and today
  FT/PT are identical, matching the owner's ครูประจำ vs ฟรีแลนซ์ model):
  - `leave_cutoff_hours_fulltime` — covers **FULL_TIME and PART_TIME**, default **3**
  - `leave_cutoff_hours_freelance` — covers **FREELANCE**, default **3**
  - `parse: intInRange(0, 72)` (hours). No schema change (`app_settings` is KV jsonb).
- **Add `"hours"` to `SettingSpec.unit`** (currently `"days"|"minutes"|"option"`) and store **hours** —
  matches the REQ label (ชั่วโมง) and the message `{n} ชั่วโมง` directly; a one-token type edit, cleaner than
  storing 180 minutes and converting.
- Registered in `lib/settings.ts` `SETTINGS`; existing number/enum settings unaffected.

## Read-site + comparator change (BE)
- Refactor `lib/leave-notice.ts` to a **pure comparator** that takes a **resolved cut-off** (it stops owning
  the constants): `hasEnoughLeaveNotice(date, startTime, cutoffHours)` → `minutesUntilClass >= cutoffHours*60`.
  Keep the `>=` boundary (AC-3: exactly N hours before is allowed).
- At **both** enforcement sites: map `teacher.type` → the right key (FULL_TIME/PART_TIME → `…_fulltime`,
  FREELANCE → `…_freelance`), `await getSetting(key, tx)` (async, pass `tx` so the read joins the booking
  transaction), then compare. Keep the read **inside** the `!override` guard (don't do it for admin cancels).
- **Rewrite `leaveNoticeMessage`** — today TH-only, no `{time}`, no `{n}`. REQ AC-7 wants **TH+EN with the
  actual `{n}` and the session `{time}`**:
  - TH `ขออภัยค่ะ ลาได้ล่วงหน้าอย่างน้อย {n} ชั่วโมงก่อนเริ่มคาบ คาบนี้เริ่ม {time} น. หากจำเป็น กรุณาติดต่อแอดมิน`
  - EN `Sorry — leave must be at least {n} hours before the session. This one starts at {time}. Please contact the admin if you need help.`
  Rendered per recipient language (the LINE path passes lang). This is a deliberate UC-029 copy change,
  in REQ-047's scope (AC-7).

## FE
No component change — `SettingsContent.tsx` already renders every registered `type:"number"` rule as a
NumberInput card. The two new rows appear automatically. Add **dictionary keys** (label + help, TH+EN) for
the two settings. ⚠️ Settings-row **labels are still BE-supplied Thai-only** (the pending label-i18n
follow-up from TASK-137 Q1) — so the bilingual label rides that follow-up; the help text can be a FE
`settings.help.<key>` now.

## Regressions to preserve (AC-6)
- **Both** enforcement sites gated (not one). Leaves already recorded are untouched (this only gates new
  attempts — safe by construction). Admin `override` bypass unchanged (AC-5).
- **Same-branch overlap with REQ-049/SPEC-044:** the sick-leave branch also carries `notify_on_leave` + the
  AC-6 idempotency guard (`:1812-1816`) — **sequence TASK-146 after/with TASK-136**, or expect a merge
  touchpoint in that block.
- Update `leave-notice.test.ts` (asserts 60/60/120 + 1h/2h boundaries — will fail on the default change).

## Tasks
- **TASK-146 (BE, Jason)** — 2 number settings (default 3, `intInRange(0,72)`) + `"hours"` unit; refactor
  `leave-notice.ts` to a comparator taking a resolved cut-off; swap both read sites to `getSetting(key,tx)`
  keyed on the session's teacher type; bilingual `leaveNoticeMessage` with `{n}`+`{time}`; update tests.
  Coordinate the same-branch merge with TASK-136 (REQ-049).
- **TASK-147 (FE, Fern)** — dictionary keys (label/help, TH+EN) for the two new settings rows. Tiny; no
  component change. (Bilingual row *label* rides the settings-label-i18n follow-up.)

## Questions
- Porter's **Q2** (does the cut-off apply to a planned absence marked for *tonight*?) is still owner-pending
  — but by construction a leave inside the cut-off is refused regardless of what it's called, so this is
  covered unless the owner wants a carve-out. Non-blocking; flagging.
