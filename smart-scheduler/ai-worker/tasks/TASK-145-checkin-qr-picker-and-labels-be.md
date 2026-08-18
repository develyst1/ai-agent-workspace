# TASK-145: Check-in — `qr` keyword uses the picker + richer labels/confirmation (BE, Gap-A/AC-3)
- Source: SPEC-043 (REQ-050)
- Status: DONE (SA-reviewed Sober 2026-08-17); Q1 (child name on check-in/qr rows) ratified; live LINE → @Tanya on dev
- Assignee: @Jason (BE)
- Depends on: none

## Context (why)
The primary LINE check-in flow already disambiguates correctly (id-keyed picker). Two gaps remain:
- **Gap A:** the `qr` keyword (`line-webhook.service.ts:354-363`) silently returns child #1's QR
  (`today[0]`), so a multi-child parent can only ever reach the first child's QR.
- **AC-3:** the check-in picker label + `checkin_ok` name only `name + time` — the REQ wants
  `{time} · ครู{teacher} · {program}`.

## What to do (smart-scheduler-back — `line-webhook.service.ts` + `line-reply.ts` + `line-i18n.ts`)
1. **Gap A:** when the `qr` keyword resolves **>1** eligible booking for the parent, use the **same
   tappable picker** `doCheckin` already uses (one button per booking, id-keyed) instead of `today[0]`.
   One booking → unchanged.
2. **AC-3 labels/confirmation:** enrich the check-in picker label and `checkin_ok` to name
   `{time} · ครู{teacher} · {program}` (data already loaded via `findTodayBookingsForParent`'s
   `with:{student,teacher,subject}`). Mirror the TASK-135 leave-label approach (full row in the prompt
   body if LINE's 20-char button clamp eats the program).
3. Bilingual (TH+EN), no raw key.

## Definition of Done
- [ ] A multi-child parent typing `qr` is shown a picker (not just child #1's QR). (Gap A / requirement 5)
- [ ] Check-in picker + confirmation name time · teacher · program. (AC-3)
- [ ] Single-eligible-booking case unchanged (no extra step).
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.

## Implementation Notes / Questions
(Jason fills in. Real LINE delivery → Tanya on dev with a test account.)

## Implementation Notes / Questions
**Files:** `src/services/line-webhook.service.ts` (the `qr` branch, `doCheckin`, `doCheckinBooking`, a shared
`sessionPicker`) · `src/lib/line-reply.ts` (`bookingPicker` accepts the `qr` action) · `src/lib/line-i18n.ts`
(`pick_qr` + enriched `checkin_ok` / `checkin_already`) · `src/lib/line-leave.ts` (`leaveSessionLabel` →
`sessionLabel`) · `src/lib/line-i18n.test.ts` (updated for the new confirmation).

1. **Gap A — `qr` now uses the picker.** The branch was `today[0]!` — a multi-child parent could only ever reach
   their **first** child's link. It is now `doQr(...)`: 0 eligible → `qr_none` · exactly 1 → the link, unchanged
   · **>1 → the same id-keyed tappable picker** check-in uses, with `action=qr&bookingId=…` routed through the
   postback switch (`qr` added to `KNOWN_POSTBACK_ACTIONS` so it can never be logged as UNHANDLED). A tapped id
   that isn't one of this parent's bookings gets `checkin_notfound` — the authorization is the same
   `findTodayBookingsForParent` list, never a payload id.
2. **AC-3 — the picker and the confirmation name the session.** Both now read
   `{time} · ครู{teacher} · {program}`, and `checkin_ok` / `checkin_already` became
   `{name} · {time} น. · ครู{teacher} · {program}`.
3. **The label rename:** `leave_pick_row` → **`session_row`** and `leaveSessionLabel` → **`sessionLabel`** —
   check-in, leave and qr now share one row format instead of two identical strings. Same values, TASK-135's
   behaviour unchanged.
4. 🔴 **One thing the task didn't ask for, and I think it must be there — the child's name on the check-in/qr
   rows.** Leave has a child-first step (TASK-135); **check-in and qr do not**, so a row reading
   `10:00 · ครูก้อง · Surfskate` doesn't tell a two-child parent *whose* class it is — which is exactly the
   confusion Gap-A exists to remove. Worse, the old check-in label *did* carry the name (`name + time`), so
   dropping it would have been a regression. Those two pickers therefore render
   `{nickname||name} · {time} · ครู{teacher} · {program}`; leave stays as TASK-135 shipped it. Composed in code
   from the existing row string — no new copy invented.
5. **20-char clamp** handled as you ratified for TASK-135: buttons carry the clamped label, the **prompt body**
   lists every full row. `sessionPicker` is now the one place that does this for all three flows.
6. **Orphan:** the old `bookingLabel` helper had no callers left, so it went (a one-line note in its place).

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **493 pass / 0 fail**. Single-eligible-booking behaviour is
unchanged on both `qr` and check-in (no extra step).

**Not verifiable from here:** the actual taps and rendered replies → @Tanya on dev with a test account, as with
the other LINE work.

## Questions
- Q1: ratify item 4 (child name on the check-in/qr rows, not on leave's). It is a deliberate deviation from the
  task text and I'd rather you approve or reject it explicitly than have it pass unnoticed.

  > answer (Sober): **ratified — and it's the right principle, not just a nice-to-have.** Check-in and qr have **no
  > child-first step** (leave does, TASK-135), so the child's name **on the row IS the child disambiguator** — which is
  > exactly what Gap-A exists to fix (the right child). Dropping it would also have regressed the old `name + time` label.
  > So `{nickname||name} · {time} · ครู{teacher} · {program}` on check-in/qr, and leave staying name-less-on-row (it asks
  > child first) is a principled asymmetry, not an inconsistency. Approved. The `sessionLabel`/`session_row` consolidation
  > (one row format across check-in/leave/qr) is a good cleanup — verified TASK-135 leave values unchanged.

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-17). Live LINE → @Tanya on dev.** Reproduced: `bunx tsc --noEmit` **0** ·
`bun test` **493/0**. Confirmed `doQr` (`line-webhook.service.ts:263`): 0→`qr_none`, 1→link unchanged, **>1→the id-keyed
picker** (`action=qr&bookingId`, added to `KNOWN_POSTBACK_ACTIONS`, auth via `findTodayBookingsForParent` not the payload
id). Picker + `checkin_ok`/`checkin_already` name `{time}·ครู{teacher}·{program}` (AC-3). Q1 ratified (above). The
`bookingLabel`→`sessionLabel` refactor consolidates check-in/leave/qr onto one row string — TASK-135 behaviour unchanged.
Single-eligible case still one step (Gap-A only fires at >1). **Verdict: DONE.** ⇒ REQ-050 code-complete (144+145);
closes on Tanya's dev check-in pass (multi-child qr + the balance-return from TASK-144).
