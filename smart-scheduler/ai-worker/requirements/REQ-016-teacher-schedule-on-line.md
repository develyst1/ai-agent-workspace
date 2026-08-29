# REQ-016: Teacher self-service — check my schedule on LINE  [LINE-B]
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-29 by stakeholder (คุณฟีน)
- Deadline: none
- Source: stakeholder direction 2026-07-29.

## Problem / Goal
A **teacher** cannot check their own schedule via LINE today — they only *receive* push notifications. They
want to look up "**what appointments do I have / today's schedule**" themselves on LINE.

## Requirement
1. A linked **teacher** can, via LINE (a command and/or a rich-menu button), see **their own schedule** —
   **today** and **this week** — listing their bookings (time, student, sport/subject, status).

## Acceptance Criteria
- [ ] A teacher on LINE can request "my schedule today" and "my schedule this week" and get their bookings back.
- [ ] Shows time + student + sport/subject (+ status) per booking; empty state when none.
- [ ] Only the teacher's own bookings (resolved from their linked `lineUserId`).

## Analysis / current state (Porter, read-only sweep — for Sober to verify)
- The teacher branch of the bot has **no commands** today (push-only: `line-webhook.service.ts` teacher path
  just says "linked, wait for notifications").
- **The data path already exists** — `GET /api/bookings?teacherId&from&to` (`validation.ts` bookingsQuery,
  `bookings_teacher_date_idx`) and `GET /api/calendar`. Pattern to mirror: the parent's
  `findTodayBookingsForParent` → an analogous `findTodayBookingsForTeacher(lineUserId, date)`. **Small work.**

## Constraints
- Reuse the existing bookings query; resolve the teacher from `teachers.lineUserId`. Presentation follows
  REQ-015 (buttons/flex) if delivered; otherwise a clean text reply.

## Out of Scope
- Teachers taking actions (confirm/leave) via LINE — read-only schedule for now.
- Phone-calendar sync (REQ-017).

## Questions
(SA + stakeholder.)
- Views = **today + this week** (confirm)? Any "a specific date"?
- Detail level per booking — time + student + sport + status enough?

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-016 | Teacher self-service — check my schedule on LINE [LINE-B] | MEDIUM | ✅ **DELIVERED** | **Live acceptance PASSED 2026-07-30** (stakeholder tested on the real OA; Porter verified from the exported transcript): a linked teacher gets **🗓️ ตารางวันนี้** (correct empty state) and **🗓️ ตารางสัปดาห์นี้** listing real bookings as `date · student · sport · status`; teacher linking by nickname works; TH/EN both render. _Previously:_ TASK-043 **DONE** (Sober-verified 2026-07-30: isolation, `weekRange` reuse, stub-retirement grep, tsc 0 / suite **131/0**). A linked teacher taps **ตารางของฉัน** (or types `ตาราง`/`schedule`) → **today's** own bookings (time · student · sport · status), quick-reply toggles **this week** (Sun–Sat); empty state + back-to-menu kept; capped at 20 + "…and N more"; TH/EN. Teacher resolved from `lineUserId` only — a forged postback can't read another teacher's schedule. _Previously: _ **@Jason — TASK-043 (queued after TASK-042).** SPEC-013 (2026-07-30). Small + BE-only: REQ-015 already wired the teacher menu's **"my schedule" button to a stub** (`line-webhook.service.ts:392`) — this fills it. Design = `findBookingsForTeacher(lineUserId, from, to)` mirroring the parent's `findTodayBookingsForParent`; today + **this week via the existing `weekRange` (Sun–Sat)**; rows show time·student·subject·status, CANCELLED excluded; quick-reply to switch views; keyword `ตาราง`/`schedule` still works; all strings TH/EN in `line-i18n`. Teacher resolved from `lineUserId` only (never from the payload). **No open business Q** — the REQ's own Requirement/AC answer both of its questions. |
```
