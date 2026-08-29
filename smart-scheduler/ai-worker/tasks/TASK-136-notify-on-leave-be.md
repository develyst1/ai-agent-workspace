# TASK-136: Notify-on-leave (BE) — enum setting + teacher push + idempotency
- Source: SPEC-044 (REQ-049)
- Status: DONE (SA-reviewed Sober 2026-08-17); teacher-push dev LINE test → @Tanya; Q2 option copy → @Porter
- Assignee: @Jason (BE)
- Depends on: none

## What to do (all in smart-scheduler-back)
1. **Extend the settings mechanism for enums** (`lib/settings.ts` + `services/settings.service.ts` +
   `validation.ts`): `SettingSpec` gains `type: "number" | "enum"` + `options: string[]`; `value` is
   `number | string`; `resolveSetting` / `setSetting.parse` / `putSetting` validator accept the enum
   members. Existing numeric settings keep `type:"number"` — verify `checkin_early_minutes` /
   `teacher_change_notice_days` still resolve unchanged.
2. **Register** `notify_on_leave`: enum, options `admin_only` | `admin_and_teacher`, **default
   `admin_only`**, with the REQ's label/help.
3. 🔴 **AC-6 idempotency guard:** at the top of the `sick-leave` branch of `updateBookingStatus`
   (`scheduler.service.ts:1784`), **early-return if `current.status === "SICK_LEAVE"`** (mirror the
   confirm/attend guards). Fixes the new teacher push AND the pre-existing admin double-notify on re-save.
4. **Teacher push** (additive, after the existing `notifyAdmins` at `:1850`): read
   `getSetting("notify_on_leave")`; if `admin_and_teacher`, load the session's teacher
   (`current.teacherId`, reuse the confirm branch's lookup — AC-3) and `enqueueLine({recipientType:"teacher",
   recipientLineUserId: teacher?.lineUserId ?? null, bookingId:id, payload:{kind:"leave_teacher",…}}, tx)`
   — inside the same `tx`, **non-throwing** (AC-4). No link → `enqueueLine` already writes SKIPPED (keep).
5. **i18n** message keys TH+EN for admin + teacher (REQ wording).

## Definition of Done
- [ ] `admin_only` (default) → admin notified, **teacher gets nothing**. (AC-1)
- [ ] `admin_and_teacher` → both; teacher msg names student + freed slot. (AC-2)
- [ ] Teacher = the **session's** teacher (`current.teacherId`), not the course's original. (AC-3)
- [ ] No teacher LINE link / send fail → leave still succeeds, a SKIPPED/visible row, never silent. (AC-4)
- [ ] Staff-initiated leave follows the same setting (same branch — confirm). (AC-5)
- [ ] Re-save / retry of a SICK_LEAVE booking → **no second** admin or teacher enqueue. (AC-6)
- [ ] Numeric settings unaffected by the enum extension.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green (tests: both setting values, idempotency, no-link SKIPPED).

## Implementation Notes / Questions
**Files:** `lib/settings.ts` (enum support + the rule) · `services/settings.service.ts` (enum error + the
`type`/`options` DTO fields) · `services/scheduler.service.ts` (AC-6 guard + teacher push) · `lib/line-admin.ts`
(`notifyAdmins` gains `bookingId`) · `lib/line-i18n.ts` + `lib/line-message.ts` (the two messages) ·
`lib/settings.test.ts` + `services/settings.service.test.ts` (updated) · `lib/notify-on-leave.test.ts` (new).

1. **Enum settings.** `SettingSpec` now carries `type: "number" | "enum"`, `default: number | string`,
   `options?`, `unit: "days" | "minutes" | "option"`. `resolveSetting` is generic
   (`SettingValue<K> = SETTINGS[K]["type"] extends "number" ? number : string`), so
   `getSetting("teacher_change_notice_days")` still hands `hasEnoughTeacherChangeNotice` a **number** — no casts
   at any existing call site. A bad enum value degrades to the coded default *with a reason*, exactly like a bad
   number (SPEC-029 AC #4). `putSetting` already accepted `number | string`, so no route change was needed.
2. **`notify_on_leave`** registered: options `admin_only` | `admin_and_teacher`, **default `admin_only`**.
3. **AC-6.** Added as a preceding branch — `action === "sick-leave" && current.status === "SICK_LEAVE"` → sets
   `notification = skipped("คาบนี้แจ้งลาแล้ว")` and changes nothing. Same effect as an early return, but it
   needed **zero re-indentation** of the 60-line branch, so the diff is readable. The tail
   `reconcileBookingHolds` still runs and is idempotent by design (TASK-028).
4. **Teacher push** — after `notifyAdmins`, gated on `getSetting("notify_on_leave", tx)`, inside the same `tx`,
   `enqueueLine({recipientType:"teacher", recipientLineUserId: teacher?.lineUserId ?? null, bookingId:id, …})`.
   Teacher is looked up from **`current.teacherId`** = the session's teacher (AC-3), not the course's original.
   No link → `enqueueLine`'s existing SKIPPED row (AC-4), and nothing here can throw a leave over.
5. **i18n** `ob_leave_admin` + `ob_leave_teacher`, TH+EN, REQ-049's wording, rendered per recipient language.

**One change beyond the literal task, flagged: `notifyAdmins(payload, exec, bookingId?)`.** The admin outbox row
carried **no** `bookingId`, so the worker's `bookingContext()` returned `{}` — the REQ's admin line
(`{date} {time} · ครู{teacher} · {program}`) would have rendered `-` for four of its five fields. Passing the id
is what makes the specced wording actually arrive. It is additive (optional param, one call site changed).

**DoD ↔ evidence.** AC-1 default-off + AC-2 opt-in + malformed-value fallback: unit-tested on the resolver.
AC-3 (session's teacher) + AC-4 (no-link SKIPPED) + AC-5 (staff leave is the *same* branch, confirmed by
reading — there is one sick-leave path regardless of trigger): code-level, no separate path exists to diverge.
AC-6: the new guard. Numeric settings unaffected: their tests pass unchanged. `bunx tsc --noEmit` **0** ·
`bun test` **488 pass / 0 fail**.

**Not verifiable from here (by design):** an actual LINE delivery. Per SPEC-044 that is Tanya on dev with a
**test teacher account** — never the 21 real prod teachers. Default `admin_only` means prod stays silent until
someone opts in.

## Questions
- Q1 (FE contract, for TASK-137): `GET/PUT/DELETE /settings` rows now carry **`type: "number" | "enum"`** and
  **`options: string[] | null`** (null for numeric rules) alongside the existing `label/unit/value/default/
  isOverridden`. `value` is `number | string`. Please confirm that is the shape Fern is building against.
- Q2 (copy): the settings row label is `แจ้งเตือนเมื่อมีการลา`; the **option labels** (`admin_only` /
  `admin_and_teacher`) are rendered FE-side from `dictionaries.ts` per SPEC-044, so I did not invent Thai
  strings for them here. Flagging so nobody expects them from the API.

  > answer (Sober): **confirmed — Q1 contract is exactly what TASK-137 builds against.** Settings rows carrying
  > `type: "number" | "enum"` + `options: string[] | null` + `value: number | string` alongside `label/unit/default/
  > isOverridden` is the SPEC-044 shape; I've told Fern in TASK-137. **Q2 correct** — option labels live in the FE
  > dictionary (the REQ's `Admin only`/`Admin and teacher` + Thai), not the API. Good split.

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-17). Teacher-push delivery → @Tanya dev/test-account; Q2 copy → Porter.**
Reproduced: `bunx tsc --noEmit` **0** · `bun test` **488/0**. Read the key spots:
- **Enum extension is clean:** `SettingSpec.type: "number" | "enum"`, `resolveSetting` generic so numeric callers
  (`teacher_change_notice_days` etc.) still receive a **number with no cast** — numeric settings genuinely unaffected.
  A bad enum degrades to the coded default with a reason, matching SPEC-029. `notify_on_leave` default `admin_only`.
- **AC-6 guard verified** (`scheduler.service.ts:1793`): a re-save of an already-`SICK_LEAVE` booking short-circuits to
  `skipped` **before** the real branch → no second enqueue, no re-run of quota/extension. Mirrors confirm/attend, and
  fixes the pre-existing admin double-notify. Correct.
- **Teacher push** (`:1879-1889`): gated on `getSetting("notify_on_leave", tx)`, teacher = `current.teacherId` (session's,
  AC-3), inside the same `tx`, non-throwing, SKIPPED-on-no-link (AC-4). AC-5 is the same single branch regardless of
  trigger. Faithful.
- **The extra I approve:** `notifyAdmins(payload, exec, bookingId?)` — the admin outbox row carried no bookingId, so the
  worker's `bookingContext()` returned `{}` and the specced admin line would have rendered `-` for 4 of 5 fields. Passing
  the id is what makes the wording actually arrive; additive (optional param, one call site). Good catch, not scope creep.
- **Verdict: DONE (code).** Real LINE delivery → @Tanya on dev with a **test teacher account** (never the 21 real prod
  teachers); default `admin_only` keeps prod silent until opt-in. REQ-049 closes with TASK-137 (FE) + that dev pass.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-136 | scheduler-back (BE): notify-on-leave — extend settings mechanism for **enum**, register `notify_on_leave` (default admin_only), AC-6 idempotency guard, teacher push in the sick-leave branch (session's teacher, non-throwing, SKIPPED-on-no-link), i18n TH/EN | SPEC-044 (REQ-049) | ✅ **DONE (code — SA-reviewed Sober 2026-08-17)** · teacher-push dev LINE test → @Tanya · Q2 option copy → Porter. Reproduced tsc 0 · 488/0. Enum extension clean (numeric callers keep `number`, no cast); AC-6 guard verified at `:1793` (re-save → skipped, kills admin double-notify); teacher push = session's teacher, in-tx, non-throwing, SKIPPED-on-no-link. `notifyAdmins` bookingId addition **approved** (needed for the admin message context). Q1 contract confirmed for TASK-137. · _prior:_ 🔎 REVIEW (Jason 2026-08-17 — `SettingSpec` gains `type`/`options`, `resolveSetting` generic so numeric callers keep `number` with no casts; `notify_on_leave` default `admin_only` ⇒ **prod silent until opt-in**. AC-6 = a preceding `sick-leave && status===SICK_LEAVE` branch (no re-indent, same as an early return) — also kills the pre-existing admin double-notify. Teacher push from `current.teacherId`, in-tx, non-throwing, SKIPPED-on-no-link. **Beyond-task, flagged:** `notifyAdmins` now takes `bookingId` — without it the admin row had no booking and 4 of the REQ's 5 fields rendered `-`. tsc 0 · **488/0**. **Q1 = the `type`/`options` DTO shape TASK-137 builds against — please confirm with Fern.** Live LINE = @Tanya on dev with a TEST teacher account, never the 21 real ones.) | Jason | — |
```
