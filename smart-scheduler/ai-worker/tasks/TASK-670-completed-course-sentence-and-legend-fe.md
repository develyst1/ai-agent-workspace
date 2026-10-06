# TASK-670 — 5a: a completed or expired course no longer says "was cancelled" · 5b: the legend gets NO-SHOW and CANCELLED — FE, XS + XS
- Source: `SIZING-teamB-next-round-pile-2026-10-05.md` §5a/§5b · **wording owner-APPROVED 2026-10-06** ("1-4 ตามแนะนำ ทั้งหมด") · Porter's plan (Fri)
- Status: DONE (reviewed by Silver, 2026-10-06)
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
**Fanta, 2026-10-06.** Repo `smart-scheduler-front`. Nothing committed. The tree also holds my uncommitted TASK-624 and TASK-665 work and no one else's.

**Files (this TASK only):**
- `M partials/Bookings/PlanModal.tsx`: a module constant `ENDED_SENTENCE: Partial<Record<CourseStatus, string>> = { COMPLETED: "course.endedCompleted", EXPIRED: "course.endedExpired" }`, and the sentence is `t((courseStatus && ENDED_SENTENCE[courseStatus]) || "course.endedNoWrites")`. **Keyed by the status the modal already reads** (`courseStatus`, line 270). No third list of ended statuses. Whatever is not named, a cancelled course or an older payload with no status, falls through to **today's sentence, byte for byte**.
- `M lib/i18n/dictionaries.ts` (`course.*` only): `endedCompleted` / `endedExpired`, EN + TH, **the owner's approved words verbatim, no DRAFT marker**. `endedNoWrites` is untouched in both languages.
- `M partials/Calendar/Calendar.config.ts`: `STATUS_LEGEND` gains `"NO_SHOW"` and `"CANCELLED"` at the end. The existing six keep their order. Labels (`bookingStatus.*`) and icons (`BOOKING_STATUS_ICON`: `UserX`, `Ban`) already existed. **No new words.**
- `?? partials/Bookings/ended-course-sentence-task670.dom.test.tsx` (5) · `?? partials/Calendar/legend-statuses-task670.dom.test.tsx` (3) · `?? partials/Bookings/ended-course-task670.mutations.json` (5 mutations).

**Verification:**
- `bun test <the two files>` → **8 pass / 0 fail**. The first five open the REAL `PlanModal` and read the sentence on screen:
  - COMPLETED shows the completed sentence and not "was cancelled";
  - EXPIRED shows the expired one and not "was cancelled";
  - a CANCELLED (ended-early) course shows today's sentence **byte for byte** (pinned);
  - an older payload with no `status` shows today's sentence too;
  - EN and TH are exactly the approved strings, counted in both languages.
  The legend tests read the rendered bar: NO_SHOW and CANCELLED are in it with the existing labels, the original six keep their order, and every chip carries an icon.
- Mutation set `ended-course-task670`: `bun run mutation:run -- --tests "src/components/partials/Bookings/ended-course-sentence-task670.dom.test.tsx src/components/partials/Calendar/legend-statuses-task670.dom.test.tsx" --mutations src/components/partials/Bookings/ended-course-task670.mutations.json`
  ```
  BASELINE 8 pass / 0 fail
  E1 COMPLETED falls back to "cancelled" ...... BITES 7/1
  E2 EXPIRED falls back ........................ BITES 7/1
  E3 the cancelled sentence replaced ........... BITES 6/2
  L1 NO_SHOW dropped from the legend ........... BITES 7/1
  L2 CANCELLED dropped from the legend ......... BITES 7/1
  CHECKSUM identical
  ```
- `bunx tsc --noEmit` exit 0 · `bun run build` exit 0.
- **Full `bun test`: 1025 pass / 4 fail across 115 files.** The 4 are exactly the four pins in TASK-624 §Questions Q1; **this TASK adds no failure and moves no pin.**
- 🚫 No click on sid or uat. **Footprint:** none (the runner restored every file).

**Decided (internal):** a status-keyed constant in `PlanModal.tsx` rather than a helper in `lib/scheduler/course-lifecycle.ts` (outside the claim, and one use).

## Questions
None for this TASK. (The pre-existing defect it fixes dates from `3f19d60`, 2026-08-25. Silver already has it for the batch, and Porter writes the release-note line.)

## Review
**Silver, 2026-10-06 — ✅ DONE.**
- **5a:** the sentence is keyed by the modal's own `courseStatus` (`ENDED_SENTENCE`); anything unnamed falls to today's sentence, byte for byte. That is no third list of statuses, exactly as asked. The **owner-approved words are verbatim, with no DRAFT marker** (machine grep: all 4 strings present).
- **5b:** NO_SHOW and CANCELLED appended to `STATUS_LEGEND` using the existing labels and icons. The original six keep their order.
- **Re-run by me:** 27 / 0 together with the People files; set 5/5. 📌 The release-note line (pre-existing since `3f19d60`) is Porter's to word.
