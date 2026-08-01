# TASK-082: scheduler-front (FE) — hide the old "Dashboard" nav entry (REQ-026 Stage 1)
- Source: REQ-026 Stage 1
- Status: DONE  (reviewed 2026-08-01 by Sober — hidden as a **typed** entry not a commented line (a commented entry rots silently and stops being one-line-reversible), and she fixed the second-order effect her own change caused on `Header`; tsc 0 / build ok)
- Depends on: none
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
The sidebar now has four statistics-ish menus and she asked *"menu เลอะเทอะไปมั้ย"*. Stage 1 is the cheap,
reversible half:

**Hide the old "Dashboard" entry from the nav. Hide — do not delete.**

- Remove it from the sidebar only. **Leave the route, the page and its components in place** so the decision
  costs one line to reverse.
- Nothing else moves. Reports, the SOM dashboard and the needs-attention panel stay exactly where they are —
  **Stage 2 (merging to Overview / Today) is an open question with the owner and is NOT in this task.**

## Why it's safe to hide — Porter checked the cost before proposing it
- **"By teacher" is already duplicated and beaten** by the Daily report's workload section, which shows sessions
  *and* attended; the old Dashboard shows a bare count.
- **"By badge" is the only unique content**, and it stands on the badge system the owner has parked — the one
  with the known defect that its report **silently drops untagged rows**.

So the screen is *what's duplicated* plus *what isn't trustworthy*. Nothing that hurts to hide.

## Definition of Done
- [ ] The "Dashboard" entry no longer appears in the sidebar.
- [ ] The route still resolves if visited directly (nothing deleted, nothing 404s).
- [ ] No other nav entry moves or changes label.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — and say what the sidebar reads top to bottom
      afterwards.

## Implementation Notes — Fern 2026-08-01

### Hidden as a type-checked entry, not a commented-out line
The Dashboard entry moved out of `NAV_ITEMS` into a new **`HIDDEN_NAV_ITEMS`** in the same file
(`AdminLayout.config.ts`). **Restoring it is moving one line back.**

I chose that over commenting the line out for one reason: **a commented-out entry rots silently.** The first
time `NavItem` gains a required field, live entries fail the build and the commented one just sits there wrong
— so the "one line to reverse" quietly stops being true. Kept as real data it stays type-checked, and the
doc comment above it records *why* it's hidden and that Stage 2 is deliberately not done here.

Route, page and components are **untouched** — nothing deleted.

### One side-effect my change created, and fixed
`Header.tsx` derives the page title from `NAV_ITEMS`, so removing the entry made `/scheduler/dashboard` fall
back to the app name ("Smart Scheduler") when visited directly. The route resolved, but it lost its own title.
Header now looks up `[...NAV_ITEMS, ...HIDDEN_NAV_ITEMS]` — **a hidden page keeps its heading; only the menu
item is gone.** The Sidebar still maps `NAV_ITEMS` alone, which is the whole point.

### Browser-checked (mock, localhost verified first)
**Sidebar top to bottom, TH:**
`ตารางเรียน → คุณครู → ผู้ปกครอง/นักเรียน → ผูก LINE → การจอง / นักเรียน → Badge → แดชบอร์ด SOM →
รายการที่ต้องดูแล → รายงานประจำวัน`

**EN:** `Schedule → Teachers → People → LINE links → Bookings / Students → Badges → SOM dashboard →
Needs attention → Daily report`

- **"แดชบอร์ด" / "Dashboard" is gone** — 9 entries, was 10. ⚠️ Note the neighbour that stays: **"แดชบอร์ด SOM" /
  "SOM dashboard"** is a different screen and is untouched, as specced.
- **No other entry moved or changed label** — order and text are otherwise identical.
- **Direct visit to `/scheduler/dashboard` still resolves**: page renders ("ภาพรวมการใช้ badge ในการจอง", date
  range, empty-state), and the header reads **"แดชบอร์ด" / "Dashboard"** — its own title, not the fallback.
- No 404, no console errors.

`bunx tsc --noEmit` **clean**; `bun run build` **succeeded** — `/scheduler/dashboard` still in the route list.

**Not done, on purpose:** Stage 2 (merging the statistics screens into Overview / Today). Reports, SOM and
needs-attention are exactly where they were.

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- If hiding it orphans an import or leaves dead code **that your change created**, clean that up; **don't**
  remove the page itself — reversibility is the point of Stage 1.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `tsc` 0 (my run); `HIDDEN_NAV_ITEMS` is a real typed array and
`Header` reads `[...NAV_ITEMS, ...HIDDEN_NAV_ITEMS]` while the Sidebar maps `NAV_ITEMS` alone — which is exactly
the split the task wanted.

- **A typed entry rather than a commented-out line**, and your reason is the right one: *"a commented-out entry
  rots silently."* The first time `NavItem` gains a required field, live entries fail the build and the
  commented one just sits there wrong — so **"one line to reverse" quietly stops being true**. Kept as data it
  stays type-checked. That's reversibility as a property instead of an intention, which is the same reasoning
  I've been applying to guards all day, applied to a nav config.
- **You found and fixed a side-effect your own change created**: `Header` derives the title from `NAV_ITEMS`, so
  removing the entry made `/scheduler/dashboard` fall back to the app name. The route resolved but the page lost
  its heading — a hidden page should keep its identity; only the menu item goes. Noticing that a *hide* had a
  second-order effect on a *different component* is the part most people miss.
- **You flagged the neighbour that stays**: "แดชบอร์ด SOM" / "SOM dashboard" is a different screen and is
  untouched. Worth saying out loud, because the two names are one word apart and someone glancing at the
  sidebar could easily report the wrong one as missing.
- Route, page and components untouched; 10 entries → 9; nothing else moved or relabelled; direct visit still
  resolves with its own title. **Stage 2 correctly not started.**

**TASK-082 → DONE. REQ-026 Stage 1 is complete** — and it stays one line from reversal, which matters because
Stage 2's shape is still an open question with the owner.
