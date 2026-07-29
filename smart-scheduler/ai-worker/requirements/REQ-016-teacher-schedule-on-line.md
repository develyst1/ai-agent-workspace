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
