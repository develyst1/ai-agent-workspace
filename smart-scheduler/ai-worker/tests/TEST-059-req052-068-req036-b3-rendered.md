# TEST-059: calendar cell (REQ-052+068) + four-status course list (REQ-036 B2/B3) — rendered pass
- Source REQ: REQ-052, REQ-068, REQ-036 (B2/B3)
- Status: TEST_PASSED (sid)
- Environments: dev-server (`sid`)
- Tested: 2026-08-25 by Tanya

## Deploy note
First run found the FE stale on `sid` (old NORMAL/LOCKED badges, time+name cells) while the BE was current — a partial
deploy, reported to Porter. The owner **redeployed the FE**; re-verified live and the current FE now renders. This pass
is on the redeployed build.

## Feature 2 — REQ-036 B2/B3 (four-status course list)
| # | Case | Result |
|---|------|--------|
| 1 | Four-status filter with counts | **PASS** — Active (9) · Completed (0) · Expired (0) · Cancelled (1); counts **sum to 10** = unfiltered total |
| 2 | Default view = ACTIVE | **PASS** — cancelled course hidden from the everyday view |
| 3 | Cancelled course shows status + reason | **PASS** — มิลล่า → "Cancelled — Admin entered it by mistake" (red + Ban) |
| 4 | 🎯 Leave-locked course = ACTIVE + separate lock chip (NOT a 5th status) | **PASS** — Aileen (locked) shows "Active" + "Locked" side by side, at 1440 and 375 |

## Feature 1 — REQ-052+068 (calendar cell)
| # | Case | Result |
|---|------|--------|
| 5 | Type legend + cell carry booking type (text label, not colour-only) | **PASS** — 1st Trial / 1 HR / Weekly course / Voucher; cell shows "Weekly course" icon+label |
| 6 | Icons only, NO emoji | **PASS** — SVG (lucide) icons; no emoji character in the legend or cells |
| 7 | Cell-display toggle (REQ-068) present | **PASS** |
| 8 | 🎯 Toggle is display-only — never changes WHICH bookings appear | **PASS** — flipping it kept the same 9 bookings (before = after) |

## 375 (Porter: start here)
No horizontal scroll on either screen; four-status filter present; locked course shows both chips; type legend + toggle present.
🟡 **Minor (cosmetic, 375 only):** course-card badges truncate to "AC…"/"LO…" — both chips present and distinguishable, labels clip.

## Lightly assessed (not a finding)
Sober's Q2 — week cell shows type as a stripe, day cell as icon+label. Both views carry the type clearly; not confusing to me,
but a judgment call the owner may want to eyeball.

## Test data created
| What | Where | Removed? |
|------|-------|----------|
| (none — read-only render pass) | dev-server | ✅ n/a |

## Verdict
**REQ-052 + REQ-068 + REQ-036 B2/B3 = TEST_PASSED on `sid`.** Both features render correctly at 375 and 1440, including both
of Porter's serious regression cases (display toggle is display-only; a leave-locked course reads ACTIVE + a separate lock
chip, not a fifth status). One cosmetic minor (375 badge truncation). Scope `sid`; `uat`/DELIVERED is the owner's call.
