# SPEC-013: Teacher self-service — "my schedule" on LINE (today / this week)
- Source: REQ-016
- Status: ACTIVE

## Overview
Let a linked **teacher** read their own schedule on LINE. Small and BE-only: REQ-015 already built the
foundation, and the data path exists — so this is filling a slot, not new plumbing.

**As-built verified:**
- The teacher rich menu already has a **"my schedule" button** whose postback `action=schedule` lands on a
  **stub** (`line-webhook.service.ts:392` → `t("teacher_schedule_soon", lang)`). REQ-016 replaces that stub.
- The parent side gives an exact template: `findTodayBookingsForParent(lineUserId, date)`
  (`checkin.service.ts:70`) resolves the person from `lineUserId`, then queries bookings with
  `{student, teacher, subject}` relations ordered by `startTime`.
- `teachers.lineUserId` lookups are already used in the webhook service.
- `lib/time.ts` already has **`weekRange(iso)`** — and it is **Sunday-start (Sun–Sat)**. Reuse it; do not
  introduce a second week convention.
- REQ-015 gives the reply toolkit: `t(key, lang)` i18n, `textReply` (auto back-to-menu quick reply),
  quick-reply/flex builders, and the postback router.

## API / Interface
**No new HTTP endpoint** — this is LINE-internal (the bot reads via a service function, like the parent flows).
- Postback actions: `action=schedule` (today, the existing button) and `action=schedule&range=week` (from a
  quick reply on the today reply).
- Keyword fallback (consistent with REQ-015's "keywords still work"): `ตาราง` / `schedule`.

## Data Model
None. No migration. Reuses `bookings` + the `bookings_teacher_date_idx` index.

## Flow
1. **Service — `findBookingsForTeacher(lineUserId, from, to)`** (put it beside the parent one in
   `checkin.service.ts`): resolve the teacher by `teachers.lineUserId` → `[]` if not linked; query `bookings`
   where `teacherId = teacher.id` **and** `date` between `from`..`to`, **excluding `CANCELLED`**, `with:
   { student: true, subject: true }`, ordered by `date` then `startTime`. (Same shape/discipline as
   `findTodayBookingsForParent`.)
   - *Status choice:* exclude only `CANCELLED`; everything else (PENDING / CONFIRMED / ATTENDED / SICK_LEAVE /
     EXTENDED) is shown **with its status label** — the REQ's AC explicitly asks for status per booking, which
     only makes sense if more than one status can appear. A teacher needs to see a not-yet-confirmed slot.
2. **Today** (`action=schedule`, or the keyword): `from = to = bangkokNow().date` → list; **empty state** when
   none. Append a **quick reply "สัปดาห์นี้ / This week"** → `action=schedule&range=week`.
3. **This week** (`range=week`): `const {start, end} = weekRange(today)` → same list grouped/ordered by date.
   Empty state when none. (Keep a quick reply back to "today".)
4. **Rendering:** per booking show **time · student · sport/subject · status** (REQ AC). Use the REQ-015 reply
   builders — flex list if it reads better, otherwise a compact text list; either way every reply keeps the
   back-to-menu quick reply (no dead ends). Long weeks: cap the list sensibly and say how many more (don't blow
   the LINE message limit).
5. **Isolation:** only ever the bookings of the teacher resolved from **their own** `lineUserId` — never accept
   a teacher id from the postback payload. (Same rule TASK-038 applied to the booking pickers.)
6. **i18n:** all new strings go in `line-i18n.ts` TH/EN (REQ-015 rule: no user-visible literal outside the
   table). Replace/retire the `teacher_schedule_soon` stub key.

## Non-functional
- Read-only; no business-logic change; no new endpoint, migration, or config. Presentation follows REQ-015.

## Tasks
- TASK-043: LINE/scheduling (BE) — `findBookingsForTeacher` + fill the `schedule` postback (today + this week)
  + keyword fallback + i18n. (Jason) (depends on: —; **sequenced after TASK-042**, the REQ-015 release blocker)

## Questions
(Sober asks; Porter answers as `> answer: ...`)
- **No blocking question.** The REQ's two open items are already answered by its own Requirement/AC — views =
  **today + this week** (Requirement #1), detail = **time + student + sport/subject + status** (AC). I did not
  invent a "specific date" view; if คุณฟีน wants one later it's a small addition.
- **Two design calls made (FYI, non-blocking):** (1) the week is **Sun–Sat**, reusing the app's existing
  `weekRange` rather than inventing a second convention; (2) the list **excludes CANCELLED** and shows every
  other status with its label. Say if คุณฟีน expects something different — both are one-line changes.
