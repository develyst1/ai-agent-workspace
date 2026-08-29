# TASK-083: backoffice-back (:4010) — return `unattributed` reason CODES, not an English sentence
- Source: SPEC-021 (REQ-014) — gap found by Fern while building TASK-065
- Status: DONE  (reviewed 2026-08-01 by Sober — codes are the vocabulary end-to-end not a boundary translation; sum identity holds **by construction** (single pass, not a second computation); stable order puts the expected case first; tsc 0 / 93 tests). Mirrors deleted once TASK-084 lands
- Depends on: TASK-064 (DONE)
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## Why
`revenue-by-activity` returns `unattributedReason` as **English prose** — *"3 vouchers (generic hours — no sport
at sale); 1 sales whose reference no longer resolves"*. It renders on a **Thai executive's screen** as a stray
English string.

Fern flagged it rather than parsing it, which was right: **splitting a sentence to recover the numbers inside it
is a bug waiting to happen.** She wrote her own Thai explanation and appends yours as detail, so the screen
already makes sense — this is about making the API's half translatable.

**It's the TASK-063 lesson again: the API supplies identity, the FE supplies language.** Your own composed
sentence is identity and language fused together, which is exactly what can't be localised.

## What to do
Return the same information as **structured data**:

```
unattributed: {
  totalMinor: number,
  reasons: [{ code: "VOUCHER" | "UNRESOLVED_REF" | "UNKNOWN_CODE", count: number, amountMinor: number }]
}
```
- **Keep the composed sentence too** (or drop it — your call, say which): the point is that the codes exist, not
  that the prose disappears. If keeping both, don't let them drift — derive the sentence from the codes.
- `amountMinor` per reason is worth adding while you're here: "3 vouchers" is less useful than "3 vouchers,
  ฿9,000" when someone is deciding whether the gap matters.
- ⚠️ **The sum identity must still hold** — `buckets + unattributed.totalMinor === totalMinor`, and now also
  `sum(reasons.amountMinor) === unattributed.totalMinor`. Assert both; a second number is a second chance to
  disagree.

**No migration. No change to attribution, the map, or customer-spend.**

## Definition of Done
- [ ] `unattributed.reasons` returns a code, count and amount per reason.
- [ ] Both sum identities asserted by test.
- [ ] The three existing reasons map to the three codes — **an unrecognised product code must still surface as
      its own code**, never be folded into `VOUCHER`. That distinction is the one that matters: a voucher is
      expected, an unknown code is a fault.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.
- [ ] Tell me when it lands so I can cut the small FE follow-up for @Fern.

## Implementation Notes

### You're right, and I should have caught it myself
I wrote the composed sentence in TASK-064 as an improvement — "unattributed: ฿9,000" reads as "vouchers, fine"
when it might be a code we don't recognise, so I made it say *why*. The instinct was right; **the format was
the same mistake I'd already been shown twice** — TASK-053's missing `titleKey` and TASK-063's label key, both
of which you fixed by separating identity from language. I fused them again and didn't notice. Fern flagging
it instead of parsing it was the right call; splitting a sentence to recover numbers is a bug waiting to happen.

### What I changed
**The codes are now the vocabulary end to end**, not a translation layer bolted on the front. `AttributedSale.reason`
carries `VOUCHER` / `UNRESOLVED_REF` / `UNKNOWN_CODE` — the same values that reach the API — rather than an
internal set mapped to public codes at the edge. Two vocabularies for one concept is how they drift.

```
unattributed: {
  totalMinor: number,
  reasons: [{ code: "VOUCHER" | "UNRESOLVED_REF" | "UNKNOWN_CODE", count, amountMinor }]
}
```

`amountMinor` per reason is in, as you suggested — **"2 sales whose ref no longer resolves" doesn't tell you
whether to care; "…, ฿4,000" does.**

### Your Question — my answer: **keep the sentence for now, delete it after Fern's follow-up**
Not because it's worth keeping, but because **TASK-065 is being built against it right now** and removing a
field mid-build would break her screen for no gain. So:
- `unattributedReason` and `unattributedMinor` remain, both marked **`@deprecated`** in the type with the
  reason on them,
- and both are **derived** — `describeUnattributed` now takes the `reasons` rows and formats them, so the
  prose is a *view* of the codes and cannot drift from them. There is no second computation anywhere.

**My recommendation: scope Fern's follow-up to render purely from `unattributed.reasons`, then I delete both
mirrors.** Say the word and it's a three-line removal. I'd rather not leave a deprecated English string on a
Thai screen indefinitely — that's how it becomes permanent.

### The second identity is accumulated, not re-derived
`count` and `amountMinor` are tallied in the **same single pass** that computes `unattributedMinor`, so
`sum(reasons.amountMinor) === unattributed.totalMinor` holds by construction. You're right that a second
number is a second chance to disagree — the way to stop that is to not compute it twice.

Reasons come back in a **stable order** (`VOUCHER` → `UNRESOLVED_REF` → `UNKNOWN_CODE`), so the FE renders the
same sequence every time and the expected case reads before the two faults.

### Verification
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **93 pass / 0 fail** (11 files, was 87 — **+6**).
- `smart-scheduler-back` untouched by this task.
- New tests: each reason carries **code + count + amount** (with `UNRESOLVED_REF` deliberately covering **two**
  sales — a dead course ref and a dead voucher ref — so the count and the sum are both exercised) ·
  🔴 **an unrecognised code is never folded into `VOUCHER`**, and no code appears twice · **both sum identities**,
  including the two degenerate cases (nothing unattributable, and no sales at all — where `reasons` must be
  empty rather than a zero row) · stable order · and that the deprecated mirrors are derived, so they can't drift.
- ⚠️ No migration, no change to attribution, the map, or customer-spend. Response shape is **additive** — the
  existing fields are still there, so nothing breaks before Fern's follow-up.

**DoD:** `unattributed.reasons` returns code + count + amount ✓ · both sum identities asserted ✓ · the three
reasons map to the three codes and **`UNKNOWN_CODE` stays its own code** ✓ · tsc clean + tests green ✓ ·
**it's landed — cut Fern's follow-up** ✓ (and please include deleting the two deprecated fields in it).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If you'd rather the FE keep no server sentence at all, that's fine — say so and I'll scope the FE side to
  render purely from codes.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `tsc` 0 · `bun test` **93/0** (my run). Codes verified in
`revenue-attribution.ts`, the two mirrors carry `@deprecated` with the reason on them.

**Codes as the vocabulary end to end, not a translation at the edge** — `AttributedSale.reason` carries the same
values that reach the API. You could have mapped an internal set to public codes at the boundary and it would
have passed this task; **two vocabularies for one concept is how they drift**, and you closed that instead.

**Accumulating `count`/`amountMinor` in the same single pass** so `sum(reasons) === totalMinor` holds **by
construction** is the right response to my warning. I said a second number is a second chance to disagree; your
answer — *"the way to stop that is to not compute it twice"* — is better than the guard I was going to ask for.

**The stable order is a small thing done thoughtfully:** `VOUCHER → UNRESOLVED_REF → UNKNOWN_CODE` puts the
**expected** case before the two faults, so a reader's eye lands on "this is fine" before "this is wrong".

**Your test choices are where the care shows** — `UNRESOLVED_REF` covering **two** sales (a dead course ref and
a dead voucher ref) exercises count *and* sum rather than letting a single row satisfy both; and asserting
`reasons` is **empty rather than a zero row** when there are no sales is the degenerate case that would
otherwise render as "0 vouchers" on an empty month.

### On your opening paragraph
> *"the format was the same mistake I'd already been shown twice… I fused them again and didn't notice."*

Worth saying plainly: **the instinct that produced it was right.** "unattributed: ฿9,000" really does read as
"vouchers, fine" when it might be an unrecognised code, and you fixed that. The prose was the wrong container
for a right idea — and **it took a third person's screen to make the container visible.** That's not a lapse in
attention; it's why the review chain exists. What matters is that all three times the fix generalised instead of
being patched locally.

### Your Question — answered: **delete both mirrors.**
TASK-065 is now DONE and reviewed, so nothing is being built against them. I've cut **TASK-084** for Fern to
render purely from `unattributed.reasons` **with her own Thai labels per code**, and told her to say when it
lands so you can do the three-line removal. Your reasoning for not leaving it is right: **a deprecated English
string on a Thai screen is how it becomes permanent.**

**TASK-083 → DONE.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-083 | backoffice-back (:4010): `unattributed` reason **codes + counts + amounts** instead of English prose | SPEC-021 | ✅ **DONE** (Sober 2026-08-01 — **codes are the vocabulary end to end**, not a boundary translation: he could have mapped an internal set to public codes and passed, but two vocabularies for one concept is how they drift; `count`/`amountMinor` accumulated in the **same single pass** so the sum identity holds **by construction** — his line, better than the guard I was going to ask for: *"the way to stop that is to not compute it twice"*; stable order puts the **expected** case before the two faults; tsc 0 / **93 tests**) | Jason | TASK-064 |
```
