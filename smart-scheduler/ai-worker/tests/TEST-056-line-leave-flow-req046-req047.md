# TEST-056: LINE advance-leave flow (REQ-046) + cut-off message (REQ-047)
- Source REQ: REQ-046, REQ-047
- Status: TEST_PASSED
- Environments: dev-server (`sid`, `som.develyst.online`) with the OA webhook temporarily pointed at `sid`
- Tested: 2026-08-20 by Tanya (verification half) + owner (LINE taps)

## Method — the ratified owner-taps / Tanya-verifies split
Tanya has no LINE phone, so per Porter's 2026-08-20 division: the **owner** performs the LINE taps (his screenshots
are the evidence for the bot/tap side), and **Tanya** verifies the **system effects** in the DB via read-only API on
`sid`. A bot reply proves the conversation; only the database proves the *leave*. This verdict combines both halves.
No writes were made by QA; all fixtures/taps were the owner's on `sid` (reset-able rehearsal box).

## Cases
| # | Case (AC) | Who | Evidence | Result |
|---|-----------|-----|----------|--------|
| 1 | REQ-046 AC-3 — child-first step fires when ≥2 children have sessions | owner tap | bot: "ลาให้ใครคะ 👇"; both มิลล่า and มิลลิม had sessions | PASS |
| 2 | REQ-046 AC-2 — session picker labelled `time · teacher · program` | owner tap | bot: "10:00 · ครูBank · Skateboard · 11:00 · ครูBank · Inline Skate" | PASS |
| 3 | REQ-046 AC-1 — confirmation names the child and the cancelled session | owner tap | bot: "แจ้งลาแล้ว: มิลล่า — 2026-08-20 11:00 น. ครูBank …" (carries `{name}`) | PASS |
| 4 | REQ-046 — the RIGHT session is marked, others untouched | Tanya DB | มิลล่า 10:00 + 11:00 are **separate `SICK_LEAVE` rows** (distinct ids); sibling's 14:00 is its own | PASS |
| 5 | REQ-046 — course leave appends a make-up at the tail, total unchanged | Tanya DB | course 5d36e8c9…: size 6 · **leaveUsed 1 · remaining 6 (total unchanged)** · **liveEndDate 2026-10-01** = the exact date the bot announced ("คาบขยาย: 2026-10-01") | PASS |
| 6 | REQ-046 — a single session does NOT extend anything | Tanya DB | มิลล่า 11:00 = `SINGLE_SESSION`, courseId null, no plan change | PASS |
| 7 | REQ-046 — quota moves per REQ-030 | Tanya DB | leaveUsed 1 of a 6-course; end extended one slot to 2026-10-01 | PASS |
| 8 | REQ-046 AC-4 — a refused leave replies with a reason (not silent) | owner tap | earlier tonight: refusing a within-cutoff leave returned the 3-hour message (not silence) | PASS |
| 9 | REQ-047 — refusal message carries the CONFIGURED cut-off + the session's own time | owner tap | bot: "ลาได้ล่วงหน้าอย่างน้อย **3 ชั่วโมง** … คาบนี้เริ่ม **17:00** น." — not hardcoded | PASS |
| 10 | REQ-047 — cut-off is an editable setting that renders | Tanya (TEST-055) | Settings screen shows the leave-notice rows (Current/Default/Edit) — verified in the six-REQ screen pass | PASS |

## The มิลลิม "double leave" — investigated, NOT a defect
My verification found a **fourth** `SICK_LEAVE` (มิลลิม had two 14:00 Dewy sessions, Surfskate + Skateboard, both
left) where Porter's account described three leaves. I flagged it as defect-or-fixture rather than guessing. Porter
investigated against the owner's screenshots + timestamps and **explained it as expected behaviour (the owner's own
two taps / a shipped feature), not a leave-isolation defect.** Recorded here so the anomaly and its resolution are
both on the record.

## Notification side — split out to REQ-049, NOT part of this verdict
The "admin notified" expectation did **not** fire on this run: the DATA REQUEST I raised showed the notification
**outbox was EMPTY** — no admin row (and, correctly, no teacher row). That was diagnosed as a **config artefact**
(no admin LINE recipient configured on `sid`), a **silent-drop gap** now closed in code as **REQ-049 AC-4 / TASK-152**
("a leave can no longer vanish without a trace"). Per Porter, the empty outbox does not touch REQ-046/047's own ACs.
**I have NOT re-verified the notification firing live** — that belongs to REQ-049 and needs an admin recipient
configured. So: REQ-046/047 PASS on the leave-flow + message ACs; the *delivery* of a leave notification is REQ-049's
verdict, still open.

## Test data created
| What | Where | Removed? |
|------|-------|----------|
| (none by QA — verification was read-only; all fixtures/taps were the owner's on `sid`) | dev-server | ✅ n/a to QA |

## Verdict
**REQ-046 = TEST_PASSED · REQ-047 = TEST_PASSED** — on `sid`, via the owner's live LINE taps (bot side, his
screenshots) + Tanya's read-only DB verification (system side). All leave-flow and cut-off-message ACs hold; the
recorded effects match what the bot told the parent. **Scope note:** this is a `sid` pass — DELIVERED still needs the
customer-prod re-check after deploy. The leave-*notification* delivery is **not** covered here (REQ-049, open).
