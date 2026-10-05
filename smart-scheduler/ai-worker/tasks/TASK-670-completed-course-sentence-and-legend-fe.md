# TASK-670 — 5a: a completed or expired course no longer says "was cancelled" · 5b: the legend gets NO-SHOW and CANCELLED — FE, XS + XS
- Source: `SIZING-teamB-next-round-pile-2026-10-05.md` §5a/§5b · **wording owner-APPROVED 2026-10-06** ("1-4 ตามแนะนำ ทั้งหมด") · Porter's plan (Fri)
- Status: IN_PROGRESS (Fanta, 2026-10-06) — ▶️ **GO (Porter, 2026-10-06): claims granted** (`course.*` keys, `Calendar.config.ts`). The wording is APPROVED, so ship it verbatim.
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-06)
- **Claim:** `partials/Bookings/PlanModal.tsx` ✅ · ✅ the `course.*` keys in `dictionaries.ts` · ✅ `src/components/partials/Calendar/Calendar.config.ts`. STOP for anything else.

## 5a (CERTAIN)
- `course.endedNoWrites` (*"This course was cancelled, so…" / "คอร์สนี้ถูกยกเลิกแล้ว…"*) shows whenever the course is "ended" (`PlanModal.tsx:270-273`: not writable and not paused). Writable means only ACTIVE.
  - ⇒ **COMPLETED and EXPIRED both say "was cancelled".**
  - **Pre-existing since `3f19d60` (2026-08-25).** Porter writes the release-note line; I flag it in the batch.
- **Build:** the sentence chosen by status:

  | status | TH | EN |
  |---|---|---|
  | COMPLETED | **คอร์สนี้เรียนครบแล้ว จึงเพิ่มหรือแก้คาบไม่ได้** | **This course is complete, so sessions can no longer be added or changed.** |
  | EXPIRED | **คอร์สนี้หมดอายุแล้ว จึงเพิ่มหรือแก้คาบไม่ได้** | **This course has expired, so sessions can no longer be added or changed.** |
  | cancelled / ended early | 🚫 **UNCHANGED** (today's sentence is true there) | unchanged |

  - **APPROVED. Ship verbatim, with no DRAFT marker.** 🚫 No "an admin can extend it" line (the owner ruled no).
  - 🚫 Don't add a third list of statuses: derive from the course status the modal already has.

## 5b (CERTAIN)
- `STATUS_LEGEND` (`Calendar/Calendar.config.ts:5-12`) lacks **NO_SHOW** and **CANCELLED**, which both draw red.
- **The owner ruled both in.** Their labels already exist and are approved (`bookingStatus`). **No new words.**
- Their icons exist (e.g. `UserX` for NO_SHOW).

## Definition of Done
- [ ] DOM tests:
  - a COMPLETED course shows the completed sentence and **not** "cancelled";
  - an EXPIRED course shows the expired one;
  - an ended-early course still shows today's sentence (pinned);
  - the legend lists NO_SHOW and CANCELLED, with the existing labels.
- [ ] Mutation set:
  - COMPLETED falls back to "cancelled" (bites);
  - EXPIRED falls back (bites);
  - NO_SHOW dropped from the legend (bites).
- [ ] `bun test`, `tsc` and `build`, with counts. Nothing committed.

## QA hand-off
- **Screen:**
  - open the plan of a finished course: *"คอร์สนี้เรียนครบแล้ว…"*;
  - open an expired one: *"คอร์สนี้หมดอายุแล้ว…"*;
  - open one ended early: still *"…ถูกยกเลิก…"*;
  - the Schedule legend shows "ไม่มาเรียน" and the cancelled entry.

## Implementation Notes

## Questions

## Review
