# TASK-065: backoffice-front (:3018) — revenue-by-activity + customer-spend screens
- Source: SPEC-021 (REQ-014)
- Status: TODO
- Depends on: **TASK-064**
- Assignee: @Fern (**smart-scheduler-backoffice-front, port 3018** — not the frontoffice)

## What to do
Two report screens on the **backoffice** (already executive-only via its own login — no role code, nothing to
gate). Follow whatever the existing P&L report screen does; this should look like it belongs.

1. **Revenue by activity** — month picker → total, plus the split by sport.
2. **Customer spend** — per student: total spend, plus their courses / vouchers / sessions. Searchable.

## ⚠️ The one thing this screen must not do
**Show `unattributed`. Never hide it, never filter it out, never fold it into an "other" that looks like a
rounding error.**

A **voucher has no sport by nature** — generic hours, and its sessions may later be different sports — so it
cannot be attributed and lands there. If the screen shows only the attributable slice, an executive reads a
clean split that **doesn't add up to the month's actual revenue**, and that is the number decisions get made on.

- Show it as its own labelled slice/row with the reason ("vouchers — not attributable to one sport").
- The split **plus** `unattributed` must visibly reconcile to the month total. If you show percentages, they
  must be of `totalMinor` — not of the attributed subset, which would quietly inflate every sport.

Otherwise: render what the API returns, don't recompute money in the browser, TH+EN, and empty months read as
"no sales this month" rather than a broken chart.

## Definition of Done
- [ ] Both screens render from TASK-064's endpoints; **no money arithmetic in the FE** beyond formatting.
- [ ] `unattributed` is **visible and labelled**, and the figures reconcile to the month total on screen.
- [ ] Percentages (if shown) are of the month total, not of the attributed subset.
- [ ] Empty month / no results read as "no data", not as an error.
- [ ] TH+EN; no regression to the existing P&L dashboard or Items CRUD.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and open both screens in a browser**, including a
      month where vouchers make `unattributed` non-zero, and say what you saw.

## Implementation Notes
(Fern fills in — include what you exercised in the browser.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Layout is yours; match the existing backoffice reports. The non-negotiable is that the numbers on screen
  **reconcile** — attributed + unattributed = total.
- If the API doesn't give you something the screen needs, flag it here rather than deriving it locally; money
  derived in two places is money that will disagree.

## Review
(Sober fills at REVIEW.)
