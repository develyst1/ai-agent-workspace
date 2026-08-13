# REQ-039: Dashboard consolidation — rename "SOM dashboard" → "Dashboard", merge "Daily report" into it (one menu)

- Status: **CAPTURED — QUEUED (post-go-live, the "dashboard rework" phase).** Design together with REQ-034.
- Priority: MEDIUM (meeting-facing polish; not blocking the customer's essential set).
- Source: คุณฟีน 2026-08-10, reviewing the live SOM dashboard.
- Pairs with: **REQ-034** (filter the dashboard figures by booking type — already SPEC_DONE / SPEC-032). Do the
  rename + merge + filter as ONE coherent dashboard pass, not three drive-by edits.

## Problem / Goal
The frontoffice has **two** dashboard-ish menus that overlap: **"SOM dashboard"** (customer / sport / growth /
demographics snapshot — REQ-013, DELIVERED) and **"Daily report"** (today's expected / attended / attendance). The
SOM dashboard *already* carries a "Today" attendance block, so the two duplicate. The owner wants **one** well-built
Dashboard.

## Requirement (to refine when the phase starts — this is capture, not spec)
1. **Rename "SOM dashboard" → "Dashboard"** (drop "SOM").
2. **Merge "Daily report" into the Dashboard** — collapse the nav to a **single "Dashboard" menu**; the daily
   attendance detail becomes a section/tab of the one Dashboard, not a separate menu.
3. **Implement it properly as one page** (owner: *"มา implement ให้ดีไปเลย"*) — a coherent single snapshot: existing
   customers · new-vs-renewing · today's attendance (from `getDailyReport`, no second count) · sport share ·
   demographics — sections of one instant.
4. **Booking-type filter (REQ-034)** applies to the merged Dashboard — a global control to view figures for
   first-trial only / voucher only / weekly-course only, for meeting use. Fold REQ-034's SPEC-032 in here.

## Out of Scope / Notes
- Not the daily LINE digest (REQ-023) — that's the push job, a different thing from the on-screen report.
- Keep the REQ-013 honesty behaviours (unknown buckets shown, not hidden) in the merged page.
- **Post-go-live.** Do NOT start until the customer essential set (REQ-038 #1–5) ships. When the dashboard phase
  opens, SA designs REQ-039 + REQ-034 together as one dashboard rework.

## Open questions (for when it's scheduled)
- Does "Daily report" have anything the SOM "Today" block lacks (per-student list, per-teacher)? If so, it becomes
  the Dashboard's attendance-detail section rather than being dropped.
- Any other meeting asks the owner mentioned ("มีหลายเรื่อง … เรื่องการนำข้อมูลมาโชว์") — gather the full list before
  scoping, so this isn't reopened item-by-item.
