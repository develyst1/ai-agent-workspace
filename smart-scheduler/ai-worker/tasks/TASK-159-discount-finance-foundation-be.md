# TASK-159: Discount finance foundation — audit columns + report split (REQ-063) (backoffice-back)

- Source: SPEC-059 (REQ-063)
- Status: DONE (SA-reviewed Sober 2026-08-22) — finance foundation ready; surfaced a real pre-existing REQ-014 bug

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced in backoffice-back: `bunx tsc --noEmit` **0** · `bun test`
**137/0** (+6); scheduler-back still 631/0. Read the code:
- **`bo` not `ops` — correct call, and rightly flagged not silently fixed.** The `ops` schema was retired by
  REQ-006; the sale path posts to `bo.movement` and `revenue.service` reads it. Applying the spec literally would
  have added columns nobody reads. Good grounding — I had the spec wrong.
- **Migration `0006`** — `ADD COLUMN IF NOT EXISTS actor/note` on `bo.movement`, additive/nullable/idempotent,
  hand-authored + journal-registered, witness = `note` (the last column, so a half-apply can't read as finished).
- **`productKind` — a real, pre-existing money-report bug, found by this task's grounding:** `/^course-\d+$/` hasn't
  matched a real code since TASK-077 (`course-{group}-{size}`), and `single-session` likewise became
  `session-{group}` ⇒ **course + single-session revenue has been landing in `unattributed`, not its sport.** Fixed
  to `^course-[a-z-]+-\d+$` / `^session-[a-z-]+$`, legacy literals kept. **The old tests asserted the bug** (used
  `course-6`) — corrected, plus a test pinning `course-6` → null now.
- **Report split** — `grossMinor` + `discountTotalMinor` (≤0) added; `totalMinor` stays **net**, so
  `grossMinor + discountTotalMinor === totalMinor` and the `buckets + unattributed === total` identity both hold
  untouched (AC-5). A DISCOUNT needs **no attribution special-case** — same item/refId ⇒ same sport ⇒ the bucket is
  net by construction (AC-6). `movementReason` spread in only when present — no pre-REQ-063 object changes shape.

**Verdict: DONE.** Foundation is ready for TASK-160/162 to write into.

## Answers / notes
- **Jason's Q1 (the report will look different) → yes, route to @Porter.** The fix moves real course/single-session
  revenue **out of `unattributed` into its sport** — a correction that will read as a jump. Porter should warn the
  owner **before** he next opens the REQ-014 report, not explain it after. This is the before/after Porter relays;
  the live numbers are the owner's to read (we run nothing).
- **Minor robustness point (non-blocking):** `course-6` (pre-TASK-077 shape) now → `null`/`UNKNOWN_CODE`, i.e. a
  legacy course sale would **flip from attributed to unattributed**. In practice there are almost certainly none
  (the sale catalogue was empty on both boxes until today's seed), so this is moot — but **@Porter, one query to
  confirm no pre-TASK-077 `course-{size}` SALE movements exist on either box** closes it; if any do, match the
  legacy shape as COURSE too (refId resolution works either way) so real revenue never silently moves to
  unattributed. Jason's null-with-a-test choice (surface dead codes loudly) is defensible; this is just the safer
  default worth confirming on a money report.
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-backoffice-back** (owns `ops.*`). Depends on nothing; **TASK-160 depends on this** (the
  columns). Money-sensitive.

## What to build

1. **Additive migration on `ops.movement`:** nullable `actor text` + `note text`. Hand-authored + journal-registered
   per this repo's migration discipline (never `drizzle-kit generate`). Existing rows unaffected. These are AC-10's
   "who applied" and "why" (the free-text reason, e.g. `โปรวันแม่`).
2. **Revenue report gross/discount/net (`lib/revenue-attribution.ts` + `services/revenue.service.ts`):**
   - A discount is a movement with `reason:"DISCOUNT"`, **same item + same `refId`** as its sale, negative
     `valueMinor`. It is **already attributed to the right sport by construction** (same item/refId → same subject) —
     do **not** special-case attribution.
   - Add the **display split** to `RevenueByActivity`: **gross** (Σ non-DISCOUNT SALE), **discountTotal**
     (Σ DISCOUNT, negative), **net** (gross + discountTotal). The existing identity `buckets + unattributed === total`
     must still hold on **net** (AC-5). Per-sport buckets are net (discount reduces its own sport — AC-6).
3. **🔴 Verify/fix `productKind` (`revenue-attribution.ts:86`):** it tests `/^course-\d+$/` but codes are
   `course-{group}-{size}` (`course-onewheel-6`). **Confirm against the live report** whether course sales are
   currently `UNKNOWN_CODE`/unattributed; if so, fix the regex to the `course-{group}-{size}` shape. AC-6 (and the
   whole per-sport revenue report) depends on this. Guard with the existing attribution unit tests (extend them to
   pin a `course-{group}-{size}` code + a negative DISCOUNT movement attributing to the same sport).

## Definition of Done
- [ ] Migration adds `actor`/`note` (nullable), applied on `sid` first per discipline; schema + ledger clean.
- [ ] A negative `DISCOUNT` movement on a course's own item attributes to that course's sport (unit test).
- [ ] Report exposes gross · discountTotal · net; `buckets + unattributed === net` holds (unit test with a
      discounted + an undiscounted sale).
- [ ] `productKind` matches real `course-{group}-{size}` codes (test); if the live report was mis-bucketing course
      sales, note it in the task so Porter can relay the before/after.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green. You run **nothing** against a DB (owner runs the migration, sid first).

## Notes / Questions
(Jason fills in. The `actor`/`note` columns are written by TASK-160 in scheduler-back — this task only defines them
+ the report. Flag if the `productKind` regex was in fact mis-bucketing, with the numbers, so Porter can tell the owner.)

## Implementation Notes
**Repo: `smart-scheduler-backoffice-back`.** Files: `drizzle/0006_bo_movement_audit.sql` (new) ·
`drizzle/meta/_journal.json` (idx 6) · `src/lib/migration-witness.ts` (0006 witness) · `src/db/schema.ts` ·
`src/lib/revenue-attribution.ts` + `.test.ts` · `src/services/revenue.service.ts`.

🔴 **One correction to the task text, made deliberately: the columns went on `bo.movement`, not `ops.movement`.**
The `ops` schema was retired by REQ-006/TASK-027 and the sale path posts to `bo` — `revenue.service.ts` reads
`boMovement`. Following the task literally would have added two columns nobody writes, to a schema nobody reads,
and left the real table without them. Flagging rather than silently "fixing" the spec.

**1. Migration `0006` (hand-authored + journal-registered, per this repo's incomplete-snapshot rule):**
`ALTER TABLE bo.movement ADD COLUMN IF NOT EXISTS actor text` / `note text` — nullable, additive, idempotent.
Witness = **`note`**, the *last* of the two columns, so a half-applied run cannot read as finished; the reasoning
is written into the entry (both statements are plain columns, so there is no index or constraint to stand for
them). Nothing reads these until TASK-160 writes them.

**2. 🔴 `productKind` WAS mis-bucketing — confirmed from the code, and it is worse than the task suspected.**
- `/^course-\d+$/` has not matched a real code since **TASK-077** made courses program-priced: they are
  `course-{group}-{size}` (`course-onewheel-6`). **Every course sale fell through to `null` → `UNKNOWN_CODE` →
  unattributed.**
- The same is true of **single sessions**: the code became `session-{group}` (TASK-077), while the function still
  only matched the literal `single-session`.
- ⇒ on the live report, **course and single-session revenue has been landing in "unattributed", not in its
  sport.** Vouchers and first-trial were unaffected. Fixed to `^course-[a-z-]+-\d+$` and `^session-[a-z-]+$`,
  keeping the two legacy literals for pre-TASK-077 rows.
- **The existing tests asserted the bug** — they used `course-6`, a code nothing has written for weeks, so they
  passed while the product was broken. Updated to real shapes, plus a new test pinning that `course-6` now
  returns `null`. **@Porter: this is the before/after to relay** — the numbers themselves are the owner's to read
  off the live report; I can't run it.

**3. Report split.** `SaleMovement`/`AttributedSale` carry `movementReason`; the service now selects
`bo.movement.reason`. `groupBySubject` adds **`grossMinor`** and **`discountTotalMinor`** (≤ 0), with
`totalMinor` unchanged as the **net** — so every existing consumer and the `buckets + unattributed === total`
identity keep working untouched. A DISCOUNT needs **no attribution special case**: same item + same refId ⇒ same
sport, so the bucket is net by construction (AC-6). `movementReason` is spread in **only when present**, so no
pre-REQ-063 object gains an `undefined` field.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **137 pass / 0 fail** in backoffice-back (+5 discount tests,
+1 legacy-code test); `smart-scheduler-back` still **631 / 0**. ⚠️ **I ran nothing against a database** — the
owner runs `0006`, **`sid` first**.

## Questions
- Q1: the `productKind` fix changes what the **existing** live report shows — course/session revenue moves out of
  "unattributed" into its sport. That is a correction, but it will look like a jump. Worth Porter warning the
  owner *before* he next opens the report, rather than explaining it after.

  > answer: (Sober)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-159 | backoffice-back (BE): **REQ-063 finance foundation** — additive migration `ops.movement.actor`/`note` (nullable, AC-10 who/why) + revenue report **gross/discount/net split** (a `reason:"DISCOUNT"` same-item/refId movement is already attributed right; add the display split, identity holds on net) + **verify/fix `productKind` `/^course-\d+$/` vs real `course-{group}-{size}`** (course sales may be unattributed today — AC-6 depends on it). | SPEC-059 (REQ-063) | ✅ **DONE (SA-reviewed Sober 2026-08-22)** — backoffice-back tsc 0 · **137/0**. Migration `0006` (`bo.movement.actor`/`note`, additive/nullable/idempotent, witness=note) — Jason correctly put it on **`bo` not `ops`** (ops retired REQ-006). Report split: `grossMinor`+`discountTotalMinor`(≤0), `totalMinor` stays **net** ⇒ identity holds, DISCOUNT nets its own sport bucket (AC-5/AC-6, no special-case). **🔴 Found a real pre-existing REQ-014 bug:** `productKind` `/^course-\d+$/` never matched `course-{group}-{size}` since TASK-077 ⇒ course+single-session revenue was landing in **unattributed**; fixed (`^course-[a-z-]+-\d+$`/`^session-[a-z-]+$`), old tests (which asserted the bug) corrected. **@Porter: warn owner the report will jump (revenue moves unattributed→sport)** + confirm no legacy `course-{size}` SALE rows. — _prior:_ 🔎 REVIEW (Jason 2026-08-22 — backoffice-back. `0006` adds nullable `actor`/`note` — 🔴 **on `bo.movement`, NOT `ops.movement` as the task said**: `ops` was retired by REQ-006 and the sale path posts to `bo`, so the literal reading would have added columns nobody writes to a schema nobody reads. Witness = `note` (the last of the two). 🔴 **`productKind` WAS mis-bucketing, and wider than suspected**: `/^course-d+$/` has not matched since TASK-077 made courses `course-{group}-{size}`, and single sessions became `session-{group}` — so **course AND single-session revenue has been landing in unattributed, not in its sport**. The old tests asserted the bug (`course-6`), so they passed while the product was broken; updated + a new test pins `course-6` → null. Report gains `grossMinor`/`discountTotalMinor` with `totalMinor` unchanged as NET, so `buckets + unattributed === total` still holds; a DISCOUNT needs no attribution special case (same item+refId ⇒ same sport). tsc 0 · **137/0** here, **631/0** in scheduler-back. ⚠️ Not run against any DB — owner runs `0006`, sid first. Q1: the fix will make the live report *look* like it jumped — worth warning the owner before he opens it.) | Sober | — |
```
