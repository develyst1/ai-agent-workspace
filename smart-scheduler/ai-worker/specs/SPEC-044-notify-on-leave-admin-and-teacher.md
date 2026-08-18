# SPEC-044: Notify on customer leave — admin always, teacher if the school enables it
- Source: REQ-049
- Status: ACTIVE

## Overview + investigation (Q4 answered)
**Today a leave notifies the admin only, never the teacher** — the `sick-leave` branch of
`updateBookingStatus` (`smart-scheduler-back/src/services/scheduler.service.ts:1784-1858`) calls
`notifyAdmins(...)` (`:1850`) which enqueues one LINE outbox row per linked admin
(`lib/line-admin.ts`, admins from `app_settings.line_admin_user_ids` — REQ-023's channel = Q1). No
teacher push exists in that branch. So this REQ **extends the existing path**: keep the admin notify,
add a teacher notify gated by a new setting. No second notification system, no second settings system.

The setting is a **two-value enum** on REQ-031's settings screen. That mechanism is **numeric-only**
today (`SettingSpec.default: number`, FE `NumberInput`), so this spec extends it to support an enum —
which is the right investment (named options are what the REQ demands, and future settings will want
enums), not a `0|1` int hack that would show staff a bare number.

## Data / settings
- **New setting** `notify_on_leave`, enum, values `admin_only` | `admin_and_teacher`, **default
  `admin_only`** (deliberate — see Testing). Registered in `lib/settings.ts` `SETTINGS`. Stored as an
  override in `app_settings` (the row absent ⇒ the coded default), same as every REQ-031 setting.
- **Enum support added to the settings mechanism** (BE): extend `SettingSpec` with
  `type: "number" | "enum"`, an `options: string[]` for enums, and a `value` that is `number | string`;
  `resolveSetting` + `setSetting`'s `parse` accept the enum members; `putSetting` validator
  (`validation.ts`) accepts the enum string. Existing numeric settings keep `type:"number"` — **no
  behaviour change to them** (verify `checkin_early_minutes` / `teacher_change_notice_days` still work).

## Flow (BE, in the sick-leave branch — additive, after the existing `notifyAdmins`)
1. 🔴 **AC-6 idempotency guard (new, must lead):** at the top of the `sick-leave` branch, **early-return
   if `current.status === "SICK_LEAVE"`** (mirror the confirm/attend re-entry guards). Today the branch
   has none, so a re-save/retry re-runs quota+extension+**re-notifies** — this guard fixes both the new
   teacher push AND the pre-existing admin double-notify. `notification_outbox` has no unique key, so
   this in-branch guard is the dedupe.
2. Admin notify: **unchanged** (`notifyAdmins`, AC-1).
3. Read `getSetting("notify_on_leave")`; if `admin_and_teacher`, load the **session's** teacher
   (`current.teacherId` — reuse the confirm branch's `tx.query.teachers.findFirst`, AC-3: the session's
   current teacher, not the course's original) and
   `enqueueLine({ recipientType:"teacher", recipientLineUserId: teacher?.lineUserId ?? null, bookingId:id, payload:{kind:"leave_teacher", …} }, tx)`.
   All inside the same `tx`, **after** the state mutations, **non-throwing** (AC-4: a notify never
   blocks the leave).
4. **AC-4 unhappy path is already built:** `enqueueLine` with no `recipientLineUserId` writes a
   `SKIPPED` outbox row with `error:"no line userId"` — visible to staff, never a silent drop. Preserve.
5. **AC-5 (staff cancel):** the sick-leave branch is the single code path regardless of who triggered
   it → staff-initiated leave follows the same setting automatically. Confirm, don't re-implement.

## Interface (FE)
Settings screen `smart-scheduler-front/src/components/partials/Settings/SettingsContent.tsx`: add an
**enum row editor** (a `SegmentedControl` / `Select`) alongside the existing `NumberInput`, driven by
`SettingRow.type === "enum"` + `options`. Thread the enum through `types/app/settings`
(`SettingRow.value: number | string`), `services/settings.service.ts` (`updateSetting` value type),
and `hooks/scheduler/useSettings.ts`. Label/options/help copy from the REQ, via `dictionaries.ts`.

## Wording (from REQ-049; i18n TH+EN, per recipient language — AC-7)
Admin: `แจ้งลา: {student} · {date} {time} น. · ครู{teacher} · {program} — แจ้งโดย {by}` /
`Leave: {student} · {date} {time} · {teacher} · {program} — reported by {by}`. Teacher:
`{student} ลาคาบ {date} {time} น. ({program}) — ช่วงเวลานี้ว่างแล้วค่ะ` /
`{student} has cancelled {date} {time} ({program}) — that slot is now free.` Settings label/options/help
per REQ §wording.

## Testing without messaging real people (REQ §Constraints — designed in)
- The setting **defaults to `admin_only`**, so teacher push is **off** until a school opts in — prod is
  safe by default.
- The `admin_and_teacher` path is verified on the **dev/sid server against a TEST teacher LINE account**
  (a teacher record linked to a tester's own LINE), **never against the 21 real prod teachers** (the
  board already excludes teacher-change dual-LINE from prod testing for exactly this reason). Tanya
  enables the setting on dev, takes a leave on a booking whose teacher is the test account, and reads
  the outbox row — no real coach is messaged. This is the "test recipient" mode the REQ asks for; no new
  dry-run subsystem is needed given default-off + dev + a test account + the SKIPPED-on-no-link behaviour.

## Regressions to preserve
Admin notify stays (`notifyAdmins` untouched); quota / auto-extension / over-quota lock / CRM / freelance
reconcile in the sick-leave branch unchanged; numeric settings unchanged by the enum extension.

## Tasks
- **TASK-136 (BE, Jason)** — extend `SettingSpec`/resolver/validator for **enum** settings; register
  `notify_on_leave` (default `admin_only`); add the **AC-6 idempotency guard**; add the teacher push in
  the sick-leave branch gated on the setting (session's teacher, non-throwing, SKIPPED-on-no-link);
  i18n message keys TH+EN. Unit tests: setting resolves both values; idempotency (re-save → no second
  enqueue); admin-only → no teacher row; admin+teacher → teacher row; no-link → SKIPPED.
- **TASK-137 (FE, Fern)** — settings screen enum row editor (`SegmentedControl`) + thread enum through
  settings types/service/hook; the `Notify on leave` control with the REQ's labels; TH+EN. Depends on
  TASK-136's `SettingRow.type`/`options` shape (coordinate the contract).

## Questions
(Jason/Fern ask here; Sober answers as `> answer: ...`.)
