# REQ-035: `ตาม ....` row must print the buyer's document TYPE in the dotted run (resolves DEF-22)

- Status: READY_FOR_SA
- Priority: HIGH — unblocks DEF-22 and the frozen-form question
- Requested: 2026-09-03 by human (dev@smartalliance.co.th)
- Scope: **อ.9 transport** (stakeholder already relabelled it) + **อ.15** (shares the builder/geometry).
  อ.14 / อ.4 / อ.9-destroy: SA to check whether the same row exists there.

## DEF-22 is RESOLVED — and it was not a double-bind to delete
The stakeholder answered the routed-up question directly. The long dotted run in `refrow4` was **never
meant to repeat the reference number**. It is a **write-in for the document type**, and it was showing
the ref number only because it was bound to the wrong field.

They have already **changed the label in the frozen a9-transport** from `ตามหนังสือขอซื้อ` to just
**`ตาม`**, precisely so the type name can sit in the dotted run:

```
BEFORE:  ☐ ตามหนังสือขอซื้อ ....<ref number>.... เลขที่ <ref number> ลงวันที่ .....
TARGET:  ☐ ตาม ....<document type name>.... เลขที่ ..... ลงวันที่ .....
```

So a9-transport's frozen geometry stands. **Only the binding changes.**

## Requirement
Bind the `refrow4` dotted run to the buyer's document **type name**, not to `$F{detail}`.

**Source:**
```
T_T_REQUEST_BUYER.BUYER_DOC_TYPE            (REQUEST_ID = the request)
    → T_S_COMMON_CODE.CODE_INT
      WHERE GROUP_CODE = 'BuyerDocType'
    → CODE_NAME
```

| CODE_INT | CODE_NAME |
|---|---|
| 1 | หนังสือขอซื้อ |
| 2 | สัญญาซื้อขาย |
| 3 | ใบสั่งซื้อ |
| 9 | อื่นๆ |

**`เลขที่` and `ลงวันที่` keep their current binding** — do not touch them. The fix removes the value
from the dotted run and puts the type name there.

## Judgement calls I am making — SA correct me if the form disagrees
1. **`CODE_INT = 9` (อื่นๆ):** print `BUYER_DOC_TYPE_OTHER` when it has a value, else fall back to
   `อื่นๆ`. The column exists for exactly this and printing a bare "อื่นๆ" on a government form
   discards information the user typed. (Sample 38406 has it null, so this path is **unverified** —
   flag it for a targeted check rather than assuming it works.)
2. **No buyer row / null `BUYER_DOC_TYPE`:** print the **empty dotted line**, never a blank label and
   never the literal `null`. Same rule as every other write-in on these forms.
3. **Never hardcode the four labels in Java or the template.** Read them from `T_S_COMMON_CODE` —
   `IS_ACTIVE`/`SEQUENCE` can change and the stakeholder has renumbered reference data before.

## ⚠️ Constraints
- **Multiple buyer rows are possible.** Filter with the Oracle-safe form
  `(STATUS IS NULL OR STATUS <> 'D')` — `STATUS <> 'D'` alone is UNKNOWN on NULL and silently drops
  rows. If more than one survives, **do not pick one arbitrarily — route the question up.**
- a9-transport stays **frozen** apart from this binding; prove it with `frozen_check.sh` (`git diff`,
  not `git status`).
- อ.15 must get the identical behaviour — it shares the builder and now the bands.
- Verify on a **real `/download`**, not preview. Mock data has hidden this whole class of defect twice.

## Acceptance Criteria
- [ ] `ตาม ....` row prints the document type name on the dotted line; the ref number appears **once**,
      under `เลขที่`.
- [ ] All four `BuyerDocType` values render correctly, read from the DB (not hardcoded).
- [ ] `CODE_INT = 9` renders `BUYER_DOC_TYPE_OTHER` — **explicitly tested**, since the sample is null.
- [ ] Missing/null type ⇒ empty dotted line; no literal `null` anywhere.
- [ ] อ.9 transport and อ.15 both correct; a9-transport otherwise byte-frozen.
- [ ] `structure_check.py` extended, **proven to fail on revert**.
- [ ] Stakeholder's eye on a real download = the final gate.

## Test data supplied by the stakeholder
`REQUEST_ID = 38406` — `T_T_REQUEST_BUYER.ID = 2979`, `BUYER_DOC_TYPE = 1` (หนังสือขอซื้อ),
`BUYER_DOC_NO = null`, `STATUS = 'A'`. Exercises the common path only.

**@Sober — confirm whether 38406 is also the อ.15 sample I asked for** (a request with checklist codes
00014 + 00020 ticked, to close DEF-21 in QA). If it is not, that data request is still open.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
