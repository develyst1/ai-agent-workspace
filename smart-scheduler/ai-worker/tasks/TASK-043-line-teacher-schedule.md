# TASK-043: LINE (BE) — teacher "my schedule" (today / this week)
- Source: SPEC-013 (REQ-016)
- Status: DONE  (reviewed 2026-07-30 by Sober — isolation + weekRange reuse + stub-retirement grep verified independently; tsc 0 / renderer 4/0 / suite 131/0; see ## Review)
- Depends on: none technically. ⚠️ **Sequenced AFTER TASK-042** (the REQ-015 release blocker) — done.
- Assignee: @Jason (smart-scheduler-back, port 4006 — LINE bot)

## What to do
Fill the teacher rich-menu slot REQ-015 already wired: `action=schedule` currently replies with the stub
`t("teacher_schedule_soon", lang)` (`services/line-webhook.service.ts:392`). Make it return the teacher's own
schedule for **today**, with a quick reply to **this week**. Read-only; no new endpoint; no migration.

**1. Service — `findBookingsForTeacher(lineUserId, from, to)`** (put it beside `findTodayBookingsForParent` in
`services/checkin.service.ts`, same shape/discipline):
- resolve the teacher via `teachers.lineUserId` → return `[]` if not linked;
- query `bookings` where `teacherId = teacher.id` and `date` between `from`..`to`, **excluding `CANCELLED`**,
  `with: { student: true, subject: true }`, ordered by `date` then `startTime`;
- **never** take a teacher id from the postback payload — always resolve from the caller's own `lineUserId`
  (same rule you applied to the booking pickers in TASK-038).

**2. Webhook — replace the stub** with a `doTeacherSchedule(lineUserId, replyToken, lang, range)`:
- `action=schedule` → **today** (`from = to = bangkokNow().date`);
- `action=schedule&range=week` → **this week** via the existing **`weekRange(today)`** helper (`lib/time.ts`)
  — it is **Sunday-start (Sun–Sat)**; reuse it, don't introduce a second week convention;
- today's reply carries a **quick reply "สัปดาห์นี้ / This week"** (→ `range=week`), and the week reply a quick
  reply back to today;
- **keyword fallback** (REQ-015 principle — keywords keep working): `ตาราง` / `schedule` hits the same action.

**3. Rendering:** per booking show **time · student · sport/subject · status**; clear **empty state** when there
are none. Use the REQ-015 reply builders (flex list if it reads better than text) — every reply keeps the
back-to-menu quick reply. For a busy week, cap the list at a sensible number and say how many more, so the
message can't exceed LINE's limits.

**4. i18n:** every new string goes in `lib/line-i18n.ts` **TH + EN** (REQ-015 rule: no user-visible literal
outside the table). Replace/retire the now-unused `teacher_schedule_soon` key.

## Definition of Done
- [ ] A linked teacher tapping **my schedule** (or typing `ตาราง`/`schedule`) gets **their own** bookings for
      **today**; a quick reply switches to **this week** (Sun–Sat via `weekRange`).
- [ ] Each row shows time + student + sport/subject + status; a teacher with nothing scheduled sees a clear
      empty state; both replies keep the back-to-menu quick reply.
- [ ] Only the caller's own bookings — the teacher is resolved from `lineUserId`, never from the payload;
      `CANCELLED` excluded, other statuses shown with their label.
- [ ] All new strings render TH **and** EN from `line-i18n`; the stub key is gone.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — add pure tests for the parts that don't need a DB (range
      selection today vs week, the row/empty-state formatter, postback parsing of `range`). The DB query +
      LINE delivery are OA/deploy-smoke under brownfield — state what you verified and the smoke steps.

## Implementation Notes

Read-only, no new endpoint / migration / config — filled the REQ-015 teacher-menu stub reusing the parent-flow
patterns.

- **`services/checkin.service.ts` `findBookingsForTeacher(lineUserId, from, to)`** (beside
  `findTodayBookingsForParent`): resolves the teacher via `teachers.lineUserId` (→ `[]` if not linked), queries
  `bookings` where `teacherId = teacher.id` and `date` in `[from..to]`, **`ne(status, "CANCELLED")`**, `with:
  { student, subject }`, `orderBy` date then startTime. **Teacher id comes only from the caller's `lineUserId`,
  never the payload** (same isolation rule as the TASK-038 pickers).
- **`lib/line-schedule.ts` `renderSchedule(rows, lang, range, cap=20)`** (new, pure): title + one line per booking
  `{when} · {student} · {subject} · {status}` — **today shows time only; week prefixes the date**; clear empty
  state; caps at 20 and appends "…and N more" so it can't exceed LINE's message limit. All copy via `t()`.
- **`services/line-webhook.service.ts` `doTeacherSchedule(lineUserId, replyToken, lang, range)`**: `today` = the
  Bangkok date; `week` = **`weekRange(date)` (Sun–Sat, the existing helper — no second week convention)**. Maps
  the DB rows → `renderSchedule`, wrapped in `textReply` (keeps back-to-menu) plus a **toggle quick reply**
  ("This week" ↔ "Today"). Replaced the `action=schedule` stub (postback carries `range=week` from the toggle) +
  added the **keyword fallback** `ตาราง`/`schedule` in the teacher message branch.
- **i18n:** added TH+EN keys `tsched_title_today/week`, `tsched_empty`, `tsched_row`, `tsched_more`,
  `btn_today/week`, and `status_*` labels; **retired `teacher_schedule_soon`** — grep of `src/` → 0 refs.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**.
- `bun test` → **131 pass / 0 fail** (24 files). New `line-schedule.test.ts` (today = time-only, week =
  date-prefixed, TH+EN status labels, empty state, cap-20 + "and 5 more"); `line-webhook.test.ts` gains the
  `action=schedule&range=week` postback-parse case.
- ⚠️ The DB query + LINE delivery are **OA/deploy-smoke** (brownfield — no DB/OA). Verified by tsc + the pure
  renderer/parse tests + inspection. **OA smoke (post-deploy):** a linked teacher taps **my schedule** → today's
  own bookings (time · student · sport · status) → tap **This week** → the Sun–Sat list → tap **Today** back; a
  teacher with nothing today sees the empty state; typing `ตาราง` gives the same; TH and EN both render.

**DoD:** teacher taps/types → their own today bookings + week toggle (Sun–Sat) ✓ · row = time+student+subject+status,
empty state, back-to-menu kept ✓ · only the caller's bookings (resolved from `lineUserId`), CANCELLED excluded,
others labelled ✓ · new strings TH+EN, stub key gone ✓ · tsc clean + `bun test` green, pure tests added ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- Views (today + this week) and the row detail come straight from REQ-016's Requirement/AC — no open business
  question. My two design calls: week = **Sun–Sat** (existing `weekRange`), and **exclude CANCELLED only**
  (show other statuses with their label). If either feels wrong once you see real data shapes, flag it here.
- Don't add teacher **actions** (confirm/leave) — REQ-016 is explicitly read-only; that would be a new REQ.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-30).** Fills the REQ-015 stub cleanly; the isolation rule and the
reuse-don't-reinvent constraints both held.
- **Isolation verified in code (the rule that matters here):** `findBookingsForTeacher` resolves the teacher
  **only** from `teachers.lineUserId` → `[]` if unlinked, then filters `teacherId` + date range +
  `ne(status,"CANCELLED")` with `{student, subject}` ordered by date/startTime. `doTeacherSchedule` takes
  **`range` from the postback but never a teacher id** — a forged payload can only change today↔week, never
  whose schedule is shown. Correct.
- **Reuse, not reinvention:** week = the existing **`weekRange(date)` (Sun–Sat)** — no second week convention,
  as specced. Renderer is a **pure** `lib/line-schedule.ts` (today = time-only, week = date-prefixed, empty
  state, **cap 20 + "…and N more"** so a busy week can't blow LINE's message limit — good detail).
- **Stub retired for real:** grep for `teacher_schedule_soon` across `src/` → **0 refs** (I re-ran it). New keys
  are TH+EN in `line-i18n`; keyword fallback `ตาราง`/`ตารางสอน`/`schedule` wired alongside the button, per the
  REQ-015 principle that keywords keep working.
- **Verified myself:** `bunx tsc --noEmit` → 0; `line-schedule.test.ts` → 4/0; full `bun test` → **131/0**.
- **DB query + LINE delivery are OA/deploy smoke** (brownfield) — accepted; the smoke steps are written down and
  ride along with the REQ-015 release.
- **Answered his flagged design calls:** both were mine and both stand — week Sun–Sat (existing helper) and
  exclude **only** CANCELLED (other statuses shown with their label, which is why the AC asks for status).
- **TASK-043 → DONE. REQ-016 → SPEC_DONE** (its only task). **TASK-044 (the `.ics` feed) is now unblocked.**
(Sober fills at REVIEW.)
