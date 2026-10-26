# TASK-054 — DEF-26: PER_TYPE partition (item 3 = everything-not-2 incl NULL) — 4 builders

- **For:** Jason (BE)  · **From:** Sober (SA)  · **Ref:** DEF-26 (stakeholder rule via Porter, full-sweep approved)
- **Depends on:** nothing.

## Defect (stakeholder-corrected rule)
`buildPersons(requestId, perType)` → `findActivePersons(requestId, perType)` matches **exact equality** on PER_TYPE.
Item 3 uses `=1`, item 4 uses `=2`. Legacy data can have PER_TYPE = 0/3/NULL/other → those people match **neither**
item and **vanish** from the form with no error/blank (DEF-21 shape: absent ≡ empty).

Stakeholder rule (verbatim): *"ถ้า per_type = 2 = ผู้รับมอบ else เป็นผู้มอบหมด … ตีไปเลยว่ามันคือผู้มอบ (per_type=1)"*
- **item 4 (ผู้รับมอบอำนาจ) ⟸ PER_TYPE = 2**
- **item 3 (ผู้มีอำนาจลงนาม) ⟸ everything else, INCLUDING NULL** (1, 0, 3, NULL, anything).

## Scope — ALL FOUR builders (Porter: full sweep approved)
`A4:38-39,142,144,214` · `A14:36-37,149,151,198` · `A6:36-37` · `A9CheckListReportBuilderBase:36-37` (covers
transport / destroy / a15). Same constants + same exact-equality call in each.

## Do — preferred: partition in Java (one query, structural guarantee)
`findActivePersonsAll(requestId)` already exists (active, no type filter). Per builder, fetch it ONCE and split:
- **item 4** = persons where `p.getPerType() != null && p.getPerType() == 2`
- **item 3** = **all the rest** (the complement — so NULL and every non-2 value land here by construction)
This makes Porter's "no person in neither or both" a **structural** property, not two query predicates you must keep in
sync, and sidesteps the Oracle NULL trap entirely. Keep the existing active/STATUS filter (it's in `findActivePersonsAll`).
Keep the pad-to-2 slots (MIN_PERSON_SLOTS) per item.
*(If you instead keep two queries, item 3's MUST be `(PER_TYPE IS NULL OR PER_TYPE <> 2)` — bare `<> 2` is UNKNOWN on
NULL and re-creates the bug. Partition-in-Java is preferred precisely to avoid that.)*

## Verify (evidence)
- **Partition unit test (required, assert — don't eyeball):** build a fixture with PER_TYPE ∈ {1, 2, 0, NULL} on one
  request; assert every active person appears in **exactly one** of item 3 / item 4, none in both, none dropped. Falsify:
  revert item-3 to `=1` → the 0/NULL people disappear → test fails.
- Real /download (QA, via me): a request whose persons include a non-1/2 or NULL PER_TYPE now shows them under item 3.
  Confirm such a person exists first (DATA REQ if needed).
- Build green across all 4 forms; mocks updated same commit ([[mock-must-mirror-db-builder]]) — include a non-1/2 person
  in a mock so the preview exercises it.

## Also (SA will do, not you)
SPEC-041 items 3/4 rows + Verify SQL updated to the corrected partition rule.

## Acceptance
All 4 builders: item 4 = PER_TYPE 2, item 3 = the complement (incl NULL); partition test proves exactly-one-bucket +
fail-on-revert; no person droppable; mocks updated; STATUS filter intact.

---

## Done — Jason 2026-09-08

Partition-in-Java, all four builders (a4 · a14 · a6 · a9-base → transport/destroy/a15):

```java
// item 4 = PER_TYPE 2 ; item 3 = the COMPLEMENT (1, 0, 3, NULL, anything else)
Map<Boolean, List<RequestPerEntity>> personsByBucket = requestPerRepository
        .findActivePersonsAll(requestId).stream()
        .collect(Collectors.partitioningBy(
                p -> p.getPerType() != null && p.getPerType() == PER_TYPE_ATTORNEY));
```

`buildPersons` now takes the bucket instead of a per-type int, so one fetch feeds both items and
"exactly one bucket" is structural rather than two predicates kept in sync. STATUS filter intact
(it lives in `findActivePersonsAll`); pad-to-2 slots unchanged.

### Partition test — required, and falsified
`A9TransportNullPathTest.perTypePartition_everyActivePersonLandsInExactlyOneItem`: fixture with
PER_TYPE in {1, 2, 0, NULL}; asserts item 4 is exactly the PER_TYPE-2 person, all three others land
in item 3, the intersection is empty, and the union equals every person fed in (nothing dropped).

**Falsified:** reverted item 3 to `=1` only, and it failed with
`AssertionFailedError: TYPEZERO (not PER_TYPE 2) must fall to item 3 — got [TYPEONE]`.
Restored: 4/4. Suite **19/19**, BUILD SUCCESS.

### Removed the orphaned query — it *was* the bug, preserved
My change left `findActivePersons(requestId, perType)` unreferenced in production (grep: only two
test stubs). It encodes the exact-equality semantics that are DEF-26, so leaving it is a trap — the
next person reuses it and recreates the defect. Removed it and both stubs, and left a note in the
repository saying not to reintroduce a per-type query and why (`PER_TYPE <> 2` is UNKNOWN for NULL
in Oracle). `PER_TYPE_AUTHORIZED` is orphaned by the complement rule and is gone from all four
builders too.

### The mock requirement — cannot be met, and I did not fake it
The task asks for a non-1/2 person in a mock "so the preview exercises it". **The preview cannot
exercise this.** Grepping `perType|PerRepository|buildPersons` across every `*PreviewBuilder`
returns nothing: the mocks construct `EvidenceSub` person rows directly with hardcoded `(1)`/`(2)`
seqs and never touch PER_TYPE or the repository. A "PER_TYPE 0 person" in a mock would change no
code path — it would look like coverage while proving nothing, which is the mock-vs-DB trap pointing
the other way. **The unit test is the coverage.** If previews should exercise builder logic at all,
that is a separate change (previews would have to run through the builders) and worth deciding
deliberately rather than by adding a decorative fixture.

### State
Suite **19/19**, BUILD SUCCESS. structure_check **34/34**, clip_check PASS, frozen_check PASS.
Changed: 4 builders + `RequestPerRepository` + 2 test files. Plus `SecurityConfig.java` —
**still not mine, 7th report**, still the unreverted ungated-download change.

**Still open, not mine:** real /download of a request whose persons include a non-1/2 or NULL
PER_TYPE — confirm such a person exists first (DATA REQ via you).

---
## Sober review — 2026-09-08 — ACCEPTED (DEF-26 code CLOSED, all 4 builders)
Verified DB-free: no 2-arg `findActivePersons`/`PER_TYPE_AUTHORIZED` left in production; a4/a14/a6/a9-base all partition
via `findActivePersonsAll` + `partitioningBy(perType==2)`; the exact-match repo method + both stubs removed with a DEF-26
note (deletes the trap that recreates the bug — good hygiene); partition test present + falsified (19/19).
**Mock point — Jason is right, my task line was mis-specified:** the preview mocks build person `EvidenceSub` rows
directly and never route through `buildPersons`/PER_TYPE, so a mock PER_TYPE person exercises no code path — decorative,
the mock-mirror trap in reverse. The **partition unit test is the coverage**; correct not to fake it. Owned.
**DEF-26 = code CLOSED.** Remaining: QA a real request with a non-1/2/NULL person → shows under item 3 (DATA REQ; QA currently halted).
