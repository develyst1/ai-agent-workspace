# TASK-169: Baht discount field takes whole BAHT, not satang (REQ-063 AC-15/16) (FE)

- Source: REQ-063 (Tanya's find, Porter verified). 🔴 **Blocking money defect — blocks the `uat` lift.**
- Status: **REVIEW** (Fern 2026-08-22 — fixed; 32/0 tests incl. 5 new pinning the baht contract. ⛔ MERGE WITH TASK-168)
- Assignee: @Fern (FE)
- Repo: **smart-scheduler-front**. **Ships together with TASK-168 (BE)** — shared wire contract; one without the
  other diverges by 100×.

## The defect
`lib/scheduler/discount.ts` treats a `BAHT` value as satang (`discountMinor = value`), while the field invites a
baht number — so typing `8000` gives ฿80 off, and the promo's `391` gives ฿3.91. Percent takes a human number;
baht must too.

## The fix (contract: `discount.value` is human — BAHT = whole baht)
- In `evaluateDiscount`, the `BAHT` branch: `discountMinor = value * 100` (baht → satang), mirroring TASK-168's BE.
  Keep the whole-number/positive check (whole **baht**).
- The **summary** already shows baht (it divides minor by 100) — verify `Discount −{disc}` and `Amount payable
  {net}` read correctly once the value is baht (e.g. `500` ⇒ `−500` shown, net `full − 500`).
- The **field** sends `discount.value` as **baht** (the number the staff typed) — matching the BE contract. Do not
  pre-multiply on the wire; the BE converts.
- Placeholder/label make clear it is baht (not satang).

## Definition of Done
- [ ] Typing `500` baht ⇒ summary `−500` and net = full − 500; the request sends `value: 500`.
- [ ] Typing `391` on a ฿1,390 trial ⇒ net ฿999 (not ฿1,386.09).
- [ ] Over-line-total (`value*100 > full`) refused with the existing message; still refuse-never-clamp; whole-baht.
- [ ] The 12 `discount.test.ts` cases updated to the baht contract (they encoded the satang bug).
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok. **Coordinate merge with TASK-168** (the wire meaning changes).

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: front `bunx tsc --noEmit` **0** · `bun test src/lib/scheduler/`
**32/0** · build ok. FE now mirrors the BE contract exactly:
- **`bahtToMinor(baht) = baht * 100` as a named export**, used in the BAHT branch — the single conversion point per
  side, greppable on both. The contract comment at the top of `discount.ts` names the defect so nobody re-infers it.
- `discountPayload` unchanged — it already sends the number staff typed, which is correct under the baht contract
  (nothing pre-multiplied on the wire; the BE converts).
- **Field states its unit** (`บาท` suffix, `500` placeholder) — a bare number box is how `391` became satang; this is
  the human-facing half a comment can't do.
- Tests rewritten (they encoded the bug) + a "whole BAHT" block with the real promo numbers (391 off ฿1,390 ⇒ net
  ฿999) and over-line-total still refuse-never-clamp. One branch fixes all five forms (shared `evaluateDiscount`).

**Verdict: DONE (code).** With TASK-168, both sides now agree: `value` = whole baht. **Merge the pair together** (or
168-first per its Q1); the deploy still gates on the owner's 0-stored-discounted-bookings SELECT. Fern's note for the
rendered pass is right and I'll carry it: **@Tanya compares the posted `bo.movement`, not the on-screen summary** —
the screen was plausible for the whole life of this bug.

## Notes / Questions
(Fern fills in. This is the visible half of the fix Tanya caught. All five forms use the shared `evaluateDiscount`,
so the one branch change fixes every form at once.)

---

## Implementation Notes (Fern 2026-08-22)
**`smart-scheduler-front@dong`, uncommitted — 3 files** (`lib/scheduler/discount.ts`, its test, `DiscountSection.tsx`).

**This was my bug.** I wrote `discountMinor = value` in TASK-161 against a comment that claimed the field was minor
units, and the summary still looked plausible — ฿3.91 off is a believable-looking number, which is exactly why it
survived my own tests. Tanya caught what a unit test written by the same person who made the mistake never would.

### The fix — one branch, one named conversion
- `evaluateDiscount`'s BAHT branch now converts through a **named export `bahtToMinor(baht) = baht * 100`**, mirroring
  TASK-168. Naming it is the actual fix: the *absence* of a named conversion is what let every layer — and two
  reviews — agree with the same 100× mistake. It is now greppable on both sides.
- **Nothing else changed shape.** `discountPayload` already sent the number the staff typed, which is correct under
  the contract, so the wire is right the moment the BE lands. **No pre-multiplying on the wire.**
- The unit contract is now written at the top of the file, naming the defect, so the next person to read
  `value` doesn't have to infer it.
- **The field itself now says the unit** — a `บาท` suffix on the input and a `500` placeholder. A bare number box is
  how "391" got read as satang in the first place; the code comment alone wouldn't have stopped a human repeating it.
- **All five forms are fixed by this one branch** — they share `evaluateDiscount`, which is why the shared component
  was worth building.

### DoD
- ✅ `500` baht ⇒ summary `−500`, net = full − 500, request sends `value: 500` — pinned by test.
- ✅ **`391` on a ฿1,390 trial ⇒ net ฿999** (not ฿1,386.09) — pinned by test, using the promo's real numbers.
- ✅ Over-line-total (`value×100 > full`) refused with the existing message, **still refuse-never-clamp** (takes
  nothing off; net stays the FULL price) — pinned.
- ✅ The old cases that **encoded the satang bug** are rewritten to baht (`5000`→`50`, `60000`→`600`, `99999`→`999`),
  plus **5 new** cases for the unit contract. `bun test src/lib/scheduler/` **32 pass / 0 fail**.
- ✅ `bunx tsc --noEmit` **0** · `bun run build` **ok**.
- ⛔ **MERGE GATE — ships with TASK-168.** Per your Q1 endorsement: BE-first fails **loud** (refused, visible),
  FE-first fails **silent** (100× under-post). If they cannot land together, **168 must go first** — my half alone
  would post 100× too little, which is the failure nobody sees.
- 🔴 Rendered check → @Tanya, together with REQ-063's `sid` money pass: the number to compare is the **posted
  movement**, not the on-screen summary — the screen was plausible throughout this defect.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-169 | scheduler-front (FE): 🔴 **REQ-063 baht/satang (blocks uat lift)** — `evaluateDiscount` BAHT: `discountMinor = value*100`; field/summary treat value as **baht** (type 500 ⇒ −500, net full−500); send `value` as baht; update the 12 satang-encoding tests; field label = baht. All 5 forms share `evaluateDiscount` ⇒ one branch fixes all. **Ships with TASK-168.** | REQ-063 AC-15/16 | ✅ **DONE (code) — SA-reviewed Sober 2026-08-22** — front tsc 0 · 32/0 · build ok. FE `bahtToMinor` named export (mirrors BE), field states `บาท`, tests rewritten + promo cases (391 off ฿1,390 ⇒ net ฿999). Both sides now agree: value = whole baht. ⛔ **Merge with TASK-168** (168-first if not simultaneous) + owner 0-stored-bookings SELECT. Tanya: verify the posted movement, not the screen. — _prior:_ 🖥️ REVIEW (Fern 2026-08-22 — **my bug, fixed.** `evaluateDiscount`'s BAHT branch now converts through a **named export `bahtToMinor(baht)=baht*100`** mirroring TASK-168 — naming it IS the fix: the *absence* of a named conversion is what let every layer and two reviews agree with the same 100× mistake, and it's greppable on both sides now. **All five forms fixed by this one branch** (they share `evaluateDiscount` — the payoff of the shared component). `discountPayload` already sent the typed number, so **the wire is correct with no pre-multiplying**. The unit contract is now written at the top of the file naming the defect, and **the field states its unit** (`บาท` suffix + `500` placeholder) — a bare number box is how `391` got read as satang, and a comment alone wouldn't stop a human repeating it. Tests: the cases that **encoded the bug** rewritten to baht (5000→50, 60000→600, 99999→999) + **5 new** pinning the contract, incl. the promo's real numbers (**391 off ฿1,390 ⇒ net ฿999**, not ฿1,386.09) and over-line-total still **refuse-never-clamp**. `bun test src/lib/scheduler/` **32/0** · tsc **0** · build ok. ⛔ **MERGE WITH TASK-168** — per Sober's Q1: BE-first fails LOUD (refused, visible), FE-first fails SILENT (100× under-post); if not simultaneous, **168 first**. 🔴 rendered → @Tanya with the `sid` money pass — compare the **posted movement**, not the summary: the screen looked plausible throughout this defect.) | Fern | — |
```
