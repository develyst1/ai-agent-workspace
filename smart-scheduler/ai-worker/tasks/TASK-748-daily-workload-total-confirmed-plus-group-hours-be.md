# TASK-748 — REQ-129 = B: the Daily Report's per-coach Total (+Group) = confirmed lessons + group work in HOURS — BE, S (≈ 0.5 d → 0.6 d)
- Source: `requirements/REQ-129-daily-report-workload-total-group.md` · Khwan *"แบบ A แต่นับงานกลุ่มเป็นชั่วโมง"* · Silver's analysis (inbox/PM.md 10-25) · Porter GRANT 2026-10-25 · answers Palm's Q6 (and Q3 = hours)
- Status: ✅ DONE · committed + pushed by Silver on Porter's "ขึ้น git" (back `bd69978` on `dong`) · no deploy
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-25)
- **Claim (granted):** `src/lib/daily-report.ts` (the workload loop only) + its tests + sets (Team B's own: I grant the pins) · `types/contract.ts` / `openapi/document.ts` ONLY if they describe Total. Back only; the shape is unchanged. 🚫 The old `getDailyReport` stays byte-identical. 🔴 SAFE command. Nothing committed.

## Build
- `byTeacher[].total` = for that coach (primary OR extra coach):
  - **lesson rows** (FIRST_TRIAL · SINGLE_SESSION · COURSE_PACKAGE · VOUCHER) **only when confirmed** (`CONFIRMED_STATUSES`: CONFIRMED · ATTENDED · NO_SHOW), i.e. exactly the coach's `count`;
  - **plus group work in HOURS**: every OTHER (ECA / Free / KOL / camp) row and every GROUP row, one row = one hour, **only in a confirmed status**.
- **OUT:** SICK_LEAVE (on leave), PENDING / EXTENDED (pending), PAUSED (awaiting), CANCELLED.
  - So a leave + its same-slot replacement now count ONCE (the replacement).
  - If a group-work row's status is not in the confirmed set but is clearly live (e.g. a camp row is born CONFIRMED), confirm it on a fixture and say so in your notes.
- ONE named rule / constant, so a later ruling is a one-line change. `count` / `attended` are unchanged.

## Definition of Done
- [ ] **By value:**
  - a coach with 6 confirmed + 3 on-leave lessons ⇒ `total` 6 (was 9);
  - 0 confirmed + 2 on-leave ⇒ 0 (was 2);
  - a 2-hour ECA ⇒ +2;
  - a 5-hour camp ⇒ +5;
  - a group class of 1 hour ⇒ +1 (its seats never count);
  - a pending lesson ⇒ +0;
  - a leave + its replacement in one slot ⇒ +1;
  - the ECA's extra coach also gets +2.
- [ ] **Mutation set:** on-leave back in · pending back in · group work counted once instead of per hour · the replacement counted twice.
- [ ] tsc · full suite (SAFE) · all REQ-124 / 737 sets still bite · the old `getDailyReport` has a 0-line diff.

## Implementation Notes
**Evidence (Bob, 2026-10-25):** full SAFE **5091 pass / 0 fail (365 files)** · tsc 0 · new test `src/lib/daily-report-task748.test.ts` 13 pass · new set `daily-report-task748.mutations.json` **9/9 BITES** · all other sets still bite in full: **737 11/11 · 743 25/25 · 741 45/45 · 742 47/47**, every CHECKSUM identical · `scheduler.service.ts` (`getDailyReport`), `som-report.service.ts`, `lib/som-report.ts`: 0-line diff. Nothing committed.

**Change (`lib/daily-report.ts`, the workload loop only):** NEW constant `WORKLOAD_STATUSES` (= `CONFIRMED_STATUSES`: CONFIRMED · ATTENDED · NO_SHOW) — the ONE rule; `t.total += 1` now runs only when the row's status is in it. One row = one hour, so a 2-hour ECA is +2, a 5-hour camp +5, a 1-hour group class +1; the extra coach gets the same. `count` / `attended` untouched; the response shape untouched; `types/contract.ts` and `openapi/document.ts` do not describe `total`, so they are untouched.
**Decision (listing):** a coach is still LISTED in `byTeacher` for every row that is neither CANCELLED nor PAUSED (as before), so «0 confirmed + 2 on leave» shows `total: 0` (the brief's «⇒ 0»), not a missing coach; a coach with only cancelled / paused rows is still absent.
**Camp rows:** checked on a fixture — a camp hour row is an OTHER row born CONFIRMED, so it is in the rule; nothing needed widening. A PENDING group-work hour (an unconfirmed ECA) adds 0 and lists the coach at 0.
**Own pins re-based (737's test, Team B's own):** Palm §8's day `total` 11 → **9** (4 confirmed lessons + 2 ECA + 3 camp hours; the pending, leave, paused and cancelled ones are out) and the coach-filter test's coach B `total` 2 → **1** (the leave row no longer adds). Both are exactly the brief's change, nothing else moved.
**Pins / set:** by value — 6 confirmed + 3 on leave ⇒ 6; 0 + 2 on leave ⇒ 0; a pending lesson +0; a leave + its replacement ⇒ 1; 2-hour ECA +2; 5-hour camp +5; 1-hour group +1; the extra coach +2 (and the filter keeps it); ATTENDED / NO_SHOW count; a relation test over 40 mixed days (total = count + confirmed group-work rows). Set: R1 on-leave back in · R2 pending back in · R3 group work once not per hour · R4 group work out · R5 the old rule back · R6 NO_SHOW out · R7 the constant widened · R8 the listing · R9 extra coaches.

## Questions
None.

## Review

**Silver, 2026-10-25 — ✅ FINAL: DONE.**
- **My re-run (SAFE):** **5091 / 0** (365 files) · tsc 0 · sets **748 9/9** · 741 45/45 · 742 47/47 · 743 25/25 · 737 11/11, all `CHECKSUM identical`.
- The old `getDailyReport` / SOM code: a 0-line diff.
- **The diff:** one constant `WORKLOAD_STATUSES` (= the confirmed set) + one guarded line in the workload loop. `count` / `attended` / the shape are unchanged.
- A coach with only leave rows stays listed at 0. That is accepted: the tile shows 0/0 → 0.
- **Own-team pins re-based by exactly this change, granted by me:** `daily-report-task737.test.ts`, where Palm §8's day total goes 11 → 9 and coach B 2 → 1.

**Silver, 2026-10-25 — ขึ้น git (Porter's order), the git-command skill.** Repo `smart-scheduler-back`, branch `dong` (the desk's working branch). `git status` showed exactly the 4 reviewed files.
```
[dong bd69978] fix: count only confirmed lessons and group-work hours in the daily workload total (TASK-748)
 4 files changed, 241 insertions(+), 5 deletions(-)
## dong...origin/dong [ahead 1]        (after fetch: not behind)
   43da846..bd69978  dong -> dong
## dong...origin/dong                  (in sync)
```
- รวมโค้ด (`merge-workflow.sh`) was **not run**: not ordered.
- No deploy.
