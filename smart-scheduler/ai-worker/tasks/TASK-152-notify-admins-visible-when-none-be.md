# TASK-152: `notifyAdmins` must not be silent when no admin is configured (BE)
- Source: REQ-049 (AC-4 "never a silent drop"), gap found live 2026-08-20
- Status: DONE (SA-reviewed Sober 2026-08-20) — REQ-049 AC-4 silent-drop gap closed; AC-1 still rides the wave-2 admin-link + test

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-20).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **564/0** (+5). Read the
code: `notifyAdmins` — `if (!ids.length)` enqueues **one** row via the existing `enqueueLine` with
`recipientLineUserId: null` + `skipReason: "no admin recipient configured"` + the `bookingId`/`payload`, then returns;
the ≥1-admin loop is byte-for-byte unchanged. The new **optional** `skipReason` on `enqueueLine` (default
`"no line userId"`) is the right touch — the row now states the *actual* fault (environment has no admin) rather than a
misleading "no link". Idempotency untouched (rides the sick-leave path; TASK-136's AC-6 re-save guard short-circuits
before `notifyAdmins`). Tests pin: zero admins → one SKIPPED with the real reason · no settings row → same · one admin →
one PENDING, no extra SKIPPED · several → one each · bookingId/payload ride the skipped row. **⇒ REQ-049 AC-4 ("never a
silent drop") is closed** — a leave now always leaves a trace, and tonight's mystery outbox would have been one query.
Correctly does **not** deliver the message: **AC-1 (admin actually notified) still needs the config step** (an admin
LINE-links `229` per env) + the wave-2 live re-test. **Verdict: DONE.**
- Assignee: @Jason (BE)
- Depends on: none

## Context (why)
Live on `sid`, three real leaves enqueued **zero** notification rows. Root cause (from the code, not a defect
in the strict sense): `notifyAdmins` (`lib/line-admin.ts:34-43`) loops over `getAdminLineUserIds()` =
`app_settings.line_admin_user_ids`; when that list is **empty**, the loop body never runs → **nothing is
enqueued, not even a SKIPPED row.** So a leave in an environment where no admin has LINE-linked produces **no
trace at all** — exactly the silent drop REQ-049 exists to prevent (the *teacher* path already writes a
visible SKIPPED row on no-link, AC-4; the admin path does not). The primary fix is a config step (an admin
LINE-links with code 229 per environment), but the silence itself is a real hole.

## What to do (smart-scheduler-back, `lib/line-admin.ts`)
In `notifyAdmins`: when `getAdminLineUserIds()` returns **zero** recipients, do **not** return silently —
enqueue **one visible `SKIPPED` outbox row** (reuse `enqueueLine` with `recipientLineUserId: null` +
`recipientType: "admin"` + the `bookingId` + a reason like `"no admin recipient configured"`), so a leave
always leaves a trace and a mis-configured environment is loud, not silent. Mirror the teacher-path
SKIPPED-on-no-link behaviour that already exists in `enqueueLine`.

## Definition of Done
- [ ] A leave with **zero** configured admins enqueues **one** SKIPPED row (`recipientType:"admin"`, reason =
      no-admin-configured, carrying `bookingId`) — never zero rows.
- [ ] A leave **with** ≥1 admin still enqueues one real row per admin (unchanged).
- [ ] Idempotency unaffected (this rides the existing sick-leave path; the AC-6 re-save guard still short-circuits).
- [ ] Unit test: zero admins → one SKIPPED admin row; ≥1 admin → real rows, no extra SKIPPED.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.

## Implementation Notes / Questions
(Jason fills in. Small; rides `notifyAdmins`, no schema change.)

## Implementation Notes
**Files:** `src/lib/line-admin.ts` (the guard) · `src/lib/line.ts` (an optional `skipReason`) ·
`src/lib/line-admin.test.ts` (new, 5 tests).

- **`notifyAdmins`:** when `getAdminLineUserIds()` returns nothing, it now enqueues **one** row via the existing
  `enqueueLine` with `recipientLineUserId: null` — so the outbox gets a visible `SKIPPED` row carrying the
  `bookingId` and the payload, exactly like the teacher path already did on a no-link. Then it returns; the
  ≥1-admin loop is byte-for-byte unchanged.
- **`enqueueLine` gained an optional `skipReason`** (default `"no line userId"`). Without it this row would have
  said "no line userId", which is **not** what happened — nobody's link is missing; the *environment* has no
  admin configured. The row now reads **`no admin recipient configured`**, so whoever reads the outbox learns the
  actual fault. One optional field, every existing caller untouched.
- **Idempotency untouched:** this rides the existing sick-leave path, so TASK-136's AC-6 re-save guard still
  short-circuits before `notifyAdmins` is reached — a re-saved leave still enqueues nothing at all.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **564 pass / 0 fail** (68 files; +5). The new tests use a
stub exec (no DB) and pin: zero admins → exactly one SKIPPED row with the real reason · **no settings row at
all** behaves the same (a fresh environment is loud, not empty) · one admin → one PENDING row and **no** extra
skipped row · several admins → one row each, unchanged · the `bookingId` and payload ride the skipped row so the
trace points back at the leave.

**Note for the live re-check:** this makes the miss *visible*; it does not deliver the message. The real fix on
`sid`/`uat` is still the config step — an admin LINE-links with code 229 per environment. After that, the same
leave produces a PENDING row instead of a SKIPPED one, which is the thing to look for on the re-test.

## Questions
(none)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-152 | scheduler-back (BE): `notifyAdmins` — when **zero** admins configured, enqueue **one visible SKIPPED** admin row (not nothing), so a leave is never silent (REQ-049 AC-4). Found live 2026-08-20 (empty outbox = no admin LINE-linked on sid; config, not the wipe). Small; rides `lib/line-admin.ts` | REQ-049 | ✅ **DONE (SA-reviewed Sober 2026-08-20)** — reproduced tsc 0 · 564/0. `notifyAdmins` zero-admins → one visible SKIPPED row (`skipReason:"no admin recipient configured"`, carries bookingId/payload); ≥1-admin loop unchanged; idempotency intact. **REQ-049 AC-4 (never silent) closed;** AC-1 (admin actually notified) still needs the config step (admin links `229`) + wave-2 re-test. (Jason 2026-08-20 — zero configured admins now enqueue **one visible SKIPPED row** via the existing `enqueueLine` (null recipient), carrying the `bookingId` + payload, so a leave always leaves a trace; the ≥1-admin loop is byte-for-byte unchanged. Added an optional `skipReason` to `enqueueLine` so the row reads **`no admin recipient configured`** rather than the misleading `no line userId` — nobody’s link is missing, the environment has no admin. AC-6 re-save guard still short-circuits before this. tsc 0 · **564/0**, +5 stub-exec tests incl. no-settings-row and the ≥1-admin no-extra-row case. ⚠️ This makes the miss visible; the live fix is still the per-env config step (admin links with 229) — after which the same leave shows PENDING instead of SKIPPED.) | Sober | — |
```
