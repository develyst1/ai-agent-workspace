# TASK-732 — the voucher sale carries a Remark (`vouchers.note`), printed by 730's family confirm — BE, S (≈ ½ d)
- Source: Khwan Q5 *"Remark เอามาจากตอนสร้างค่ะ"* · **DECIDED YES under the owner's delegation** (`NOTE-owner-delegated-decisions-2026-10-12.md`, Porter 2026-10-12) · sized in `SIZING-teamB-khwan-answers-2026-10-12.md` §1
- Status: ✅ DONE (Silver, 2026-10-12) · uncommitted: schema + `0068` + journal 69 + the witness entry + validation + the `createVoucher` field + the 63 count pins + the 725 test's 2 lines
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-12)
- **Claim (asked of Porter, one list):**
  - `src/db/schema.ts` (`vouchers.note`) + **migration `0068`** + its journal/snapshot + **the ONE `0068` witness/ledger entry** (as for 0067);
  - `src/validation.ts` (the `createVoucher` body: optional `note`, the attendee-note rule: trim, max 200);
  - `scheduler.service.ts` `createVoucher`: **writing `note`, ONE field** (Team A's file);
  - `lib/voucher-sold-notice.ts` (yours, 730) reads it.
  - 🔴 SAFE test command only (TASK-723 has it). 🔴 run → list → ask → THEN edit.

## Build
1. One nullable `vouchers.note` text column (`0068`, `IF NOT EXISTS`, no backfill).
2. `createVoucher` accepts an optional `note` (trimmed; empty ⇒ null; max 200) and stores it. `importVoucher` unchanged.
3. **730's confirm prints `Remark : {note}` only when non-empty** (the line already exists, omitted today).
4. The voucher DTO carries `note` if a screen needs to show it later (decide; declare).

## Definition of Done
- [ ] By-value tests: a sale with a note ⇒ stored + printed; without ⇒ null + omitted; whitespace-only ⇒ null; over 200 ⇒ the validator's refusal; an import ⇒ unchanged.
- [ ] Migration self-check / ledger parity (offline). Mutation set: the note not stored · printed when empty · whitespace kept.
- [ ] tsc · full suite (SAFE) with counts. Nothing committed.

## Implementation Notes
**Bob, 2026-10-12 — BUILT (the grants: your list, DTO = NO, the 63 count pins = Porter's grant). Nothing committed. Journal is now 69 (`0068`).**
- `db/schema.ts` `vouchers.note: text("note")`; NEW `drizzle/0068_vouchers_note.sql` = `ALTER TABLE "vouchers" ADD COLUMN IF NOT EXISTS "note" text;` (one nullable column, no backfill, no data written); journal idx 68 (`when` 1783000000064); **the ONE witness** `0068_vouchers_note` (probe = the column, rerunnable).
- `validation.ts` `createVoucher`: `note: attendeeNote.optional()` (trim, max 200 — a 201-char note is a 400 BEFORE any sale).
- `scheduler.service.ts` `createVoucher`: `const saleNote = … trim … || null` once, `note: saleNote` in the insert (blank ⇒ null), and the same value handed to the family confirm. `importVoucher` untouched (pinned: no `saleNote`, no `note:`).
- `lib/voucher-sold-notice.ts`: `note` joins the payload ONLY when non-empty (no key otherwise ⇒ the payload is byte-identical to 730's); 730's renderer already prints `Remark : {note}` as the last line only when it has a value.
- **`toVoucherDTO` NOT touched** (your answer: NO).
- Also applied (grants): the 63 count pins in 38 test files (68 → 69, each comment extended `· 🔻 TASK-732: +0068`; every line matched the expected shape — the script throws otherwise), `makeup-cancel-family-task537.test.ts` (the one TASK-548 test), `rich-menu-admin-task530.test.ts` (3 lines), and `cancelReason` at `scheduler.service.ts:3464` — **only for `TEACHER_LEAVE`** (`...(cancelReason === "TEACHER_LEAVE" ? { cancelReason } : {})`), so every other make-up payload stays byte-identical to TASK-537's (task537's exact `toEqual` pins stay green).
- Tests: NEW `lib/voucher-note-task732.test.ts` (**6**: the validator both ways incl. 200/201 and whitespace; the sale's normalisation + hand-off, the import unchanged; the confirm with/without a note; the migration SQL/journal/witness/schema) + `.mutations.json` (**7 BITES · 0 SURVIVED**, checksum identical: N1 not stored · N2 printed empty · N3 whitespace kept · N4 cap gone · N5 not handed to the confirm · N6 wrong witness column · N7 schema loses it). 730's test + set re-pointed at the new call line.
- **Offline migration self-check:** 69 SQL files = 69 journal entries = 69 witnesses, the last `0068_vouchers_note` in all three (the parity pins in the suite pass). `db:verify`/`db:preflight` NOT run (they read a database; engineers never run against sid).
- **Full suite (SAFE): 4543 pass / 1 fail (341 files); tsc 0.**

## Questions
1. 🔴 The 1 red: **`src/services/admin-line-link-task725.test.ts` lines 397–398** (my own TASK-725 test, but outside this grant): *"journal + witness registered: idx 67"* asserts `J.entries.at(-1)` and `SCHEDULING_WITNESSES.at(-1)` are `0067`. Journal 69 makes `0068` the last. Fix: look the entry up by `idx` / tag (as I did for makeup-702) — 2 lines. May I?
2. The next uat note must say **Journal 69** (Porter's line). TASK-733 (FE) pairs with this.

## Review
- **Silver, 2026-10-12:** ✅ the 2 lines in `admin-line-link-task725.test.ts:397-398` (look `0067` up by idx + tag instead of `.at(-1)`) are **GRANTED by me**. It is Team B's own TASK-725 test, the same fix Porter ruled for `task702:327`. Reported to Porter. Apply, re-run SAFE, nudge me for the final review of 731 + 732 + 734.

## Review
**Silver, 2026-10-12 — ✅ FINAL: DONE.**
- **Re-run by me on a STABLE tree (SAFE):** the full back suite **4544 / 0**. Set `voucher-note-task732` **7/7 BITES**, `CHECKSUM identical`.
- `vouchers.note` (`0068`, journal **69**); `createVoucher` stores it; 730's confirm prints `Remark` only when non-empty; imports unchanged; the DTO untouched (declined: no reader).
- The 63 count pins (granted) + the 2 own-team lines in `admin-line-link-task725.test.ts` (granted by me, reported).
