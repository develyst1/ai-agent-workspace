# TASK-673 — the swap dialog on a GROUP series offers no "this session only" — FE, XS · SCREEN SECOND
- Source: owner ruling 2026-10-06 ("server first, the screen second") · the server half is TASK-672 · found in TASK-624 Q3
- Status: IN_PROGRESS (Fanta, 2026-10-07) — ▶️ GO.
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-06)
- **Claim:** `partials/OtherSeries/*` ✅ (Team B's this round), incl. `series-scope.dom.test.tsx`. 🚫 **`Calendar/Modal/GroupSwapDialog.tsx` is Team A's**, and it already sends no `onDate` (pinned at `lib/scheduler/series-scope.test.ts:252-253`). Do not touch it.
- Ships after (or with) TASK-672. It is fine for the server fix to go first.

## §0 Why
- On a GROUP series, `OtherSeriesDialogs.tsx` shows the scope choice for every swap (HEAD `:213-219`). "This session only" sends `onDate`, which the group route cannot honour.
  - Today it silently swaps the whole group from today **and pays the one-session rate from today onward** (TASK-672 §0).
- TASK-672 makes the server refuse it. **This TASK makes the screen never offer it**, so an admin is not refused for a choice we put in front of them.

## What to do
1. On a **GROUP** series (`seriesRef.kind === "group"`), the swap dialog offers **only "from here on"**: no "this session only" radio, and therefore never the one-session cover rate box.
   - **Other** series keep both scopes exactly as they are (the TASK-624 behaviour, pinned).
   - **Decide and declare** the shape (e.g. the radio group shows the one valid option, or the scope is fixed to `rest` with the date picker labelled as today). 🚫 **No new wording:** reuse `otherSeries.scopeRest` / `fromDate`. If a new sentence seems needed, STOP and ask me.
2. The body for a group swap can then only ever carry `fromDate`, never `onDate`, never the cover `rateMinor`.

## Definition of Done
- [ ] **Clicked DOM tests:**
  - GROUP: no "this session only" option, and Save posts `{ to, fromDate[, rateMinor] }`, **never `onDate`**;
  - OTHER: both scopes still offered and unchanged (pinned).
- [ ] Mutation set (front form): "this" offered on a group again (bites) · `onDate` sent for a group (bites).
- [ ] `bun test`, `tsc` and `build`, with counts. 🚫 No click on sid or uat. Nothing committed.

## QA hand-off
- **Screen:** a GROUP's Manage plan → Swap ⇒ only "from here on" is offered.
- **Screen:** an ECA (other) series → Swap ⇒ both scopes, as before.

## Implementation Notes

## Questions

## Review
