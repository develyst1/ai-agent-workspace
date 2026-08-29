# TASK-203: Scheduled LINE on a course's start date (REQ-072 part 3) — SIZING (scheduler-back)

- Source: REQ-072 part 3 (Porter: "size separately; if it doesn't fit, ship 1–2 and say so"). 🟡 LOW-until-sized.
- Status: 🔍 **SIZING (Sober 2026-08-28)** — not a build task yet; the shape + one owner question first.
- Repo: **scheduler-back**.

## The ask
A LINE **on the start date, when there is a class that day.** Unlike parts 1–2 (a reaction to a click), this is a
**scheduled** notification — nothing triggers it except the calendar reaching that day.

## Shape (SA sizing)
- It needs a **day-START job** (a cron, mirroring the existing **day-END** job in `jobs.service.ts`): each morning, find
  today's course sessions whose course starts today (or has a class today), enqueue a LINE. Idempotent per (course, day)
  so a re-run doesn't double-send (an outbox key, like the existing confirm/attend guards).
- **This is genuinely more than parts 1–2** — a new scheduled entry point + an idempotency key + a run record. It does
  NOT fit inside TASK-201, which is why Porter said size it separately.

## 🔴 Owner question (route via @Porter) before cutting a build task
- **Recipient + trigger:** is the start-day LINE to the **teacher** (they have a class today) or the **parent** (their
  child has class today)? And is it "the course's **start date**" only, or **every** day the course has a class? Porter's
  note says "start date when there is a class that day" — the two readings differ a lot (one message vs a daily reminder
  system). **Do not guess — this decides whether it's a small job or a notification platform.**

## Recommendation
**Ship TASK-201 + TASK-202 (parts 1–2) now**; hold part 3 until the owner answers recipient + frequency. Parts 1–2
already deliver the headline value (bulk confirm + unblocking REQ-062).
