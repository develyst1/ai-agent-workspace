# TASK-215: Import SAVE schema strips `leaveQuota` → off-card import can't save (import-form batch) (scheduler-back)

- Source: TASK-214 trace (Fern). 🔴 Small but BLOCKS the off-card save shipped in TASK-213/214. On `develop`. No schema.
- Status: ✅ **BE DONE (Sober 2026-08-29)** — TWO lines (leaveQuota + expiryDate-optional, TASK-213 edit never applied); save schema round-trip proven + preview/save-parity guard test. tsc 0·930/0. Off-card save unblocked (FE 214). 🔴 row-in-Postgres = Tanya/owner sid.
- Repo: **scheduler-back**.

## The gap (attributed)
`leaveQuota` is declared on `importCoursePreview` (`validation.ts:577`) but **not on the SAVE schema
`importCoursePackage` (`:496`)**, which has no `.passthrough()`. So **zod strips `leaveQuota` on save** → the service's
`input.leaveQuota` is `undefined` → `decideImportSize(size)` with no quota returns `ok:false` → **an off-card import is
refused "fill in the leave quota" even though the staff member filled it in.** Preview accepts it, save drops it — the
field is present on both ends and absent from the contract in the middle (TASK-170/204 class).
**Whose:** TASK-213 added `leaveQuota` to preview, not save; **and my TASK-213 review verified `decideImportSize` but not
the off-card SAVE round-trip** — mechanism, not outcome, again. Fern caught it by tracing the round trip.

## Fix
- Add `leaveQuota: z.coerce.number().int().min(0).max(20).optional()` to `importCoursePackage` (`:496`) — identical to
  the preview line. That's the one line.

## DoD — the OUTCOME (an off-card course actually saves)
- [ ] 🔴 An **off-card import with a stated quota SAVES** (round-trip: request → service sees `leaveQuota` → course
      created with the derived expiry) — a test that the save path receives the quota, not a schema unit test alone.
- [ ] 4/6/10 (no quota) still saves. `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green.

## Notes
(Jason fills in. One line + one round-trip test. Unblocks TASK-214's off-card save.)
## Implementation Notes
**Files:** `validation.ts` (the import save schema) · `src/validation.import.test.ts` (new, 8).

**It was not one missing line, it was two — and the second one is worse.** Fern found `leaveQuota` missing from
the save schema. Checking the file showed **`expiryDate` was still required** as well: *neither* of TASK-213's
two edits to that schema had actually applied. My task notes claimed "`expiryDate` is now optional on the
import schema" — **that claim was false when I wrote it.**

**How it happened, plainly:** both edits were text substitutions that printed no error, and I took "no error" as
"applied" instead of reading the file back. Then my tests exercised the pure rule (`decideImportSize`) and never
the schema that feeds it, so 922 tests passed over a feature that could not save. That is the same
mechanism-not-outcome miss we have both been naming all week, in my own work, one layer below where I was
looking.

**The fix is the two fields. The deliverable is the test that would have caught them:**
- the save schema **keeps** `leaveQuota` (including `0`, which is a real answer, not a missing one);
- the value that survives the schema is the one `decideImportSize` then accepts — **the two halves asserted
  together**, because either half alone passed while the feature was broken;
- `expiryDate` omitted parses, and a typed date is carried through;
- 🔑 **every field the preview schema accepts is also accepted on save.** The gap was exactly that one schema
  learned a field and its twin did not; this is the cheapest thing that catches the next one.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **930 pass / 0 fail** (+8).
No migration (`0026` from TASK-213 still carries the column).

⚠️ **Still not the full outcome:** these prove the value survives the *schema*, not that a row lands in Postgres.
The off-card save on `sid` is Tanya's/the owner's check, with `0026` applied.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-215 | scheduler-back (BE): **import-form batch** — `leaveQuota` missing from the SAVE schema (zod strips it) so an off-card import is refused even when the quota is filled. One line + a round-trip test. | SPEC-068 | 🔎 **REVIEW** (Jason 2026-08-29 — 🔻 **it was TWO missing lines, and the second is worse**: Fern found `leaveQuota`; reading the file showed **`expiryDate` was still required** too — *neither* of TASK-213's edits to that schema had applied, and **my task notes claimed expiry was optional when it was not.** Cause, plainly: both were text substitutions that printed no error and I took "no error" as "applied" instead of reading the file back; then my tests exercised the pure rule and never the schema feeding it, so **922 tests passed over a feature that could not save**. Same mechanism-not-outcome miss, in my own work, one layer below where I was looking. **The fix is two fields; the deliverable is the test**: the save schema keeps `leaveQuota` (incl. `0`, a real answer not a missing one) · the value that survives the schema is the one `decideImportSize` accepts — **both halves in one assertion, since either alone passed while it was broken** · `expiryDate` omitted parses and a typed date carries through · 🔑 **every field the preview accepts is accepted on save** (the gap was exactly one schema learning a field and its twin not). tsc 0 · **930/0** (+8), no migration. ⚠️ Proves the value survives the SCHEMA, not that a row lands in Postgres — the off-card save on `sid` is Tanya's/the owner's, with `0026` applied.) 🔴→✅ **QA 2026-08-29 (Tanya, TEST-061): found off-card SAVE 500 (`เกิดข้อผิดพลาดภายในระบบ`), then RE-RAN after TASK-217/`0027` → FIXED.** Original: CARD size 6 → 201 but OFF-CARD 8 q3 / 5 q1 → 500 (free slot, explicit+computed expiry — root cause was a DB `CHECK` still enforcing 4/6/10 while the app owned the size). After `0027` on `sid`: **OFF-CARD size 8 q3 → 201 + a real `course_packages` row (`leave_quota`=3) + 8 weekly sessions**; CARD still 201; invalid size = message not 500. **The row lands — item 4 CLEARED, no longer blocks uat.** | Sober | — |
```
