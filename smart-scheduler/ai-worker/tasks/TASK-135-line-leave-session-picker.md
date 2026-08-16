# TASK-135: LINE leave — richer session picker + confirmation + child step (BE)
- Source: SPEC-041 (REQ-046)
- Status: DONE (SA-reviewed Sober 2026-08-16); live LINE pass → @Tanya; Q1 approved; Q2 copy → @Porter
- Assignee: @Jason (BE)
- Depends on: none

## Context (why)
Leave is **already** recorded per session (bookingId) on every path — the data model is correct. But in
LINE it *looks* day-level because the picker label is `name + time` and the confirmation names only the
student + make-up date, never which session was cancelled. This task makes the session identity visible.
All in `line-webhook.service.ts` + `line-reply.ts` + `line-i18n.ts`. **No change to `updateBookingStatus`
behaviour** (quota/extension/make-up/freelance all stay).

## What to do
1. **Enrich the leave picker label** (`bookingLabel`, ~L217-218) used when a day has >1 eligible session:
   `{time} · ครู{teacher} · {program}` (EN `{time} · {teacher} · {program}`). Data is already loaded —
   `findTodayBookingsForParent` fetches `with: { student, teacher, subject }`. Keep labels within LINE's
   quick-reply length limit (clamp as today).
2. **Child-first step (AC-3):** if the parent has **≥2 children who each have an eligible session today**,
   ask `ลาให้ใครคะ / Which child?` (tappable, one button per child) before the session step. If only one
   child has sessions today, skip it (common case stays one tap).
3. **Confirmation names the cancelled session (AC-1/AC-3):** new i18n key(s), TH+EN —
   `แจ้งลาแล้ว: {date} {time} น. ครู{teacher} — คาบนี้จะถูกเลื่อนไปต่อท้ายคอร์ส` /
   `Leave recorded: {date} {time} with {teacher} — this session moves to the end of the course.`
4. **Negative path (AC-4):** unchanged — `doLeaveBooking` already accepts only CONFIRMED and the cutoff
   (`LEAVE_NOTICE_TOO_LATE`) is server-side. Reuse REQ-047's refusal wording; do not add a second.

## Definition of Done
- [ ] A 2-session day shows tappable options labelled time · teacher · program; leave applies to only the
      tapped one; the other is untouched. (AC-2)
- [ ] A parent with 2 children who both have a session today is asked which child first. (AC-3)
- [ ] The confirmation names the cancelled session's date · time · teacher. (AC-1/AC-3)
- [ ] Single-session-per-day case is unchanged (still one tap, no extra questions). (AC-5)
- [ ] Quota / extension / make-up / freelance reconcile behaviour unchanged (no edit to
      `updateBookingStatus` sick-leave branch).
- [ ] All new strings via i18n, TH+EN, no raw key shown; taps not typed numbers.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.

## Implementation Notes
**Files (5, all in `smart-scheduler-back`)**
- `src/lib/line-leave.ts` (new) — the pure pieces: `childrenWithSessions()`, `needsChildStep()`,
  `leaveSessionLabel()`.
- `src/lib/line-leave.test.ts` (new) — 7 unit tests.
- `src/lib/line-i18n.ts` — 3 new keys, TH+EN: `pick_leave_child`, `leave_pick_row`, `leave_ok_session`.
- `src/lib/line-reply.ts` — new `childPicker()` (same shape as `bookingPicker`, payload `action=leave&studentId=`).
- `src/services/line-webhook.service.ts` — `doLeave` gains the child step + the enriched picker; `doLeaveBooking`'s
  confirmation names the session; the `leave` postback passes `params.studentId` through.

**Flow now** (`doLeave`): eligible = today's CONFIRMED rows → none ⇒ `empty_leave` (unchanged) → if a
`studentId` arrived from the child step, filter to that child (still only rows
`findTodayBookingsForParent` returned, so the authorization is unchanged) → else if **≥2 children each have a
session**, send the child picker and stop (AC-3) → one session ⇒ leave it directly (AC-5, single-session day is
byte-for-byte the old path) → otherwise the session picker with `{time} · ครู{teacher} · {program}` buttons.
`doLeaveBooking` is untouched apart from the confirmation string, so **`updateBookingStatus` and all
quota/extension/make-up/freelance behaviour is unchanged** — no edit to its sick-leave branch.

`bookingLabel` (name + time) stays exactly as it was for the **check-in** picker — only the leave picker changed.

**Verification (in `H:\scheduler\smart-scheduler-back`)**
- `bunx tsc --noEmit` → **0**
- `bun test` → **474 pass / 0 fail** (61 files) — 467 before this task, the 7 new tests are the delta, nothing
  regressed.
- Tests map to the DoD: 2 sessions/1 child ⇒ **no** child step · 2 children ⇒ child step · single session ⇒ no
  step (AC-5) · one entry per child · TH/EN label renders time · teacher · program · a row with no teacher or
  subject still renders (never a raw key or `undefined`).
- Not verifiable from here (needs a live OA + a real parent account): the actual taps and the rendered reply.
  That is Tanya's pass, same as the other LINE work.

**One judgement call I want on the record (see Q1): LINE clamps a quick-reply label to 20 characters.**
`09:00 · ครูก้อง · Surfskate` is 26 — the clamp (`clampLabel`, unchanged) eats exactly the program, i.e. the
field the REQ is about. So the picker **prompt body** now lists the same `time · teacher · program` line per
session (using the same i18n row, no new copy), and the buttons carry the clamped label. Without that, the
DoD's "labelled time · teacher · program" is only true up to 19 characters.

## Questions
- Q1 (the clamp, above): is listing the full rows in the prompt body the shape you want, or would you rather
  the button read `{time} · {program}` (fits more often) and drop the teacher? Either is a few lines; I did not
  want to silently ship a truncated label as if it satisfied AC-2.
- Q2 (copy): the new confirmation uses the REQ's exact string, which **drops the child's name** that the old
  `leave_ok` carried (`แจ้งลาสำเร็จ ✅ ({name})`). With the child step that name is usually one tap back, but on
  the single-session path it's gone. Keep as specced, or add `{name}`? Porter's call via you — one line either
  way. (`{extended}`/`{locked}` are appended unchanged, so the make-up date and the quota-lock warning are not
  lost.) `leave_ok` is now unused by this path but left in place — it's not mine to delete.

  > answer (Sober): **route to Porter, my rec = add `{name}`.** Dropping the child's name is a small regression from the
  > old `leave_ok`, and on the single-session path (no child step) the confirmation would then name the *session* but not
  > *whose* it is — a multi-child parent loses a useful check. Adding `{name}` back is strictly more informative and
  > costs a token. It's user-facing copy so Porter approves the final string; ships as-specced meanwhile. (Leaving the
  > now-unused `leave_ok` in place is correct — not yours to delete.)

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-16). Live LINE pass → @Tanya.** Reproduced, not trusted.
- **Reproduced:** `bunx tsc --noEmit` **0** · new tests part of **12/0** · full suite **474 pass / 0 fail** (was 467;
  +7 new, no regression). Read the wiring: `doLeave` → `needsChildStep(eligible)` (≥2 children with sessions) →
  `childPicker`; else `leaveSessionLabel` enriched buttons; single-session day is byte-for-byte the old path (AC-5).
  `doLeaveBooking` only gains the session-naming confirmation — **`updateBookingStatus` sick-leave branch untouched**, so
  quota/extension/make-up/freelance all unchanged (AC-5 regression held). `bookingLabel` left as-is for the **check-in**
  picker — correctly scoped to leave only.
- **Q1 (the 20-char clamp) — approved, good judgment.** LINE clamps a quick-reply button to 20 chars, which would eat
  the program (the field the REQ is about). Jason's fix — list the full `{time} · ครู{teacher} · {program}` per session
  in the picker **prompt body**, buttons carry the clamped label (time still distinguishes) — is the right shape: AC-2's
  "distinguishable" is satisfied by the body, and no new copy was invented. Keep it. (Don't drop teacher/program to fit
  the button — the body carries them.)
- **Verdict: DONE (code).** Real taps + rendered reply need a live OA + a real parent account → **@Tanya's LINE pass**
  (same as the other LINE work). REQ-046 closes on that pass.
