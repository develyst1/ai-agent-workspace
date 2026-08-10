# REQ-023: LICENSE_MOVE + LICENSE_MOVE_A10 — "ประเภทการขออนุญาต" must be `ReqMovePermitType` (MV/SD/EX) derived from the request chain

- Status: READY_FOR_SA
- Priority: **HIGH**
- Raised: 2026-07-24 — stakeholder, after taking the dashboards forward: **"ผ่าน 70% เพราะทีมนายทำงานโดยไม่เข้าใจ
  ระบบมากพอ และข้อมูลไม่เพียงพอ และโปรเจค database มันซับซ้อนมาก"**. This is fix #1 of the follow-up list.

## ⚠️ READ FIRST — this SUPERSEDES TASK-041 (REQ-021 finding 2), which we shipped on a wrong premise
TASK-041 pointed a10's **col5 ประเภทการขออนุญาต** at the `MoveRequestType` common-code group, inferred from DR-17
(observed domain `{0,1}` ⊂ `{0..5}` + the hardcoded strings being truncations of that group's labels).
The inference was *procedurally* sound — and **still wrong**, because we never established what the field **means to
the business**. It is not an `INFORM_REQUEST_TYPE` label at all: it is the **permit type of the originating request**,
resolved by walking the request chain. Sober must treat TASK-041's change as **reverted/replaced** for col5, and
confirm whether `INFORM_REQUEST_TYPE` still feeds anything at all.
*(Recorded as a lesson, not an excuse: data-shape evidence can only tell you what values exist, never what they mean.
When a field's meaning is unknown, that is a question for the stakeholder — the same way we treat SQL as their call.)*

## What the filter is, exactly (verified in the FE source)
`move_request_type` is the **"ประเภทการขออนุญาต"** family in **both** dashboards — not the ประเภทการขนย้าย one:
- `dashboard-move-license/SearchCriteria.tsx` L122 `label: "ประเภทการขออนุญาต:"` → `move_request_type_ddl`
- `dashboard-move-license/ListTable.tsx` L165-167 `title: "ประเภทการขออนุญาต"` → `dataIndex: move_request_type_name`
- `dashboard-move-a10/SearchCriteria.tsx` L122 + `ListTable.tsx` L165-167 — identical
- **ประเภทการขนย้าย is a different field** → `transport_type_code_name`. Do not touch it.

## The correct source — `T_S_COMMON_CODE` group `ReqMovePermitType` (exactly 3, all active, DISPLAY_TYPE ALL)
| SEQUENCE | CODE_STR | CODE_NAME |
|---|---|---|
| 1 | `MV` | ขนย้าย |
| 2 | `SD` | ขายขนย้ายในราชอาณาจักร |
| 3 | `EX` | ขายขนย้ายนอกราชอาณาจักร |

`CODE_INT` is **currently NULL** for all three. **Stakeholder will populate `CODE_INT` later** — until then
**hardcode the mapping** (stakeholder's explicit instruction: *"เดี๋ยวฉันแก้ที่ TS COMMON ให้ ที่ code_int แต่ fix
hard code ไปก่อน"*):

```
MV = 3   SD = 5   EX = 6      // these are T_T_REQUEST.REQUEST_TYPE values
```
Cross-check against the `RequestType` group already in the table — they line up exactly, which is a good sign the
mapping is right: 3 = คำขออนุญาตขนย้ายวัตถุหรืออาวุธฯ (อ.9) · 5 = คำขออนุญาตขายหรือจำหน่ายฯ ในราชอาณาจักร (อ.15) ·
6 = คำขออนุญาตขายหรือจำหน่ายฯ ส่งออกไปนอกราชอาณาจักร (อ.14).
⇒ Isolate the 3 pairs in **one** constant so the later switch to `CODE_INT` is a one-line change. Leave a comment
pointing at this REQ so nobody "cleans up" the hardcode before the DB is updated.

## The derivation — walk the request chain (stakeholder's rule, verbatim intent)
```
T_T_REQUEST_MOVE.REQUEST_ID  →  T_T_REQUEST R (the อ.9 itself)

R.REF_REQUEST_ID is EMPTY   ⇒  MV   (a standalone อ.9 — "ก็นั่นแหละ MV")
R.REF_REQUEST_ID is PRESENT ⇒  look up the PARENT: T_T_REQUEST P WHERE P.ID = R.REF_REQUEST_ID
                               then filter/label on P.REQUEST_TYPE  → 5 = SD · 6 = EX
```
This is the **shadow อ.9** relationship already documented in `DidSpf.WebApi.Center/CLAUDE.md`: selling requires
moving, so an อ.14 (export) or อ.15 (domestic) automatically spawns a shadow อ.9. A user-created standalone อ.9 has no
parent. **The knowledge was in our own repo docs and we did not apply it** — see the retrospective below.

### ⚠ Implementation trap Sober must handle
`TTRequestEntity.RefRequestId` is `int?` **initialised to `0`** (`DidSpf.Oracle.DataAccess.SPF/Entities/TTRequestEntity.cs`
L225-226). "No parent" may therefore appear as **NULL or 0** depending on how the row was written.
⇒ the MV predicate must be `REF_REQUEST_ID IS NULL OR REF_REQUEST_ID = 0` (confirm against the DATA REQUEST below).
Treating only NULL as "no parent" would silently drop MV rows.

Both dashboards' queries already join `T_T_REQUEST R ON R.ID = L.REQUEST_ID` (`TTLicenseRepository` L149/L172/L192),
so the parent lookup is one extra LEFT JOIN on `R.REF_REQUEST_ID`, pre-aggregated per the REQ-011/012 perf rules —
**no correlated subquery**.

## Acceptance
- [ ] `move_request_type_ddl` in **both** dashboards returns exactly the 3 `ReqMovePermitType` options, in `SEQUENCE`
      order, active + `DISPLAY_TYPE` SPF (REQ-021 lookup semantics).
- [ ] `move_request_type_name` (table column) shows ขนย้าย / ขายขนย้ายในราชอาณาจักร / ขายขนย้ายนอกราชอาณาจักร.
- [ ] Selecting each of the 3 filters the table **and** the charts correctly; MV returns the rows with no parent request.
- [ ] `transport_type_code_name` (ประเภทการขนย้าย) untouched; backbone filters, dates, other columns untouched.
- [ ] The MV/SD/EX ⇄ 3/5/6 mapping lives in ONE constant, commented as temporary pending `CODE_INT`.

## 📋 DATA REQUEST (Porter → stakeholder) — measure before coding this time
```sql
-- 1) Distribution of the chain: how many อ.9 have no parent, and what types the parents are
SELECT CASE WHEN R.REF_REQUEST_ID IS NULL OR R.REF_REQUEST_ID = 0 THEN 'MV (no parent)'
            ELSE 'parent type ' || P.REQUEST_TYPE END              AS BUCKET,
       COUNT(*)                                                     AS REQUESTS
FROM T_T_REQUEST_MOVE RM
JOIN T_T_REQUEST R ON R.ID = RM.REQUEST_ID
LEFT JOIN T_T_REQUEST P ON P.ID = R.REF_REQUEST_ID
GROUP BY CASE WHEN R.REF_REQUEST_ID IS NULL OR R.REF_REQUEST_ID = 0 THEN 'MV (no parent)'
              ELSE 'parent type ' || P.REQUEST_TYPE END
ORDER BY 1;

-- 2) Is "no parent" stored as NULL, as 0, or both?
SELECT CASE WHEN R.REF_REQUEST_ID IS NULL THEN 'NULL'
            WHEN R.REF_REQUEST_ID = 0     THEN 'ZERO'
            ELSE 'HAS PARENT' END AS KIND, COUNT(*)
FROM T_T_REQUEST_MOVE RM JOIN T_T_REQUEST R ON R.ID = RM.REQUEST_ID
GROUP BY CASE WHEN R.REF_REQUEST_ID IS NULL THEN 'NULL'
              WHEN R.REF_REQUEST_ID = 0     THEN 'ZERO' ELSE 'HAS PARENT' END;
```
**Why before coding, not after:** query 1 tells us whether any parent has a `REQUEST_TYPE` **outside {5,6}** — if one
exists, the 3-value model is incomplete and we must ask rather than silently bucket it. Query 2 settles the NULL-vs-0
trap above. Both are cheap; guessing either is exactly the failure mode that produced the 70%.

## ❓ Open — Porter will ask, do NOT expand scope
`dashboard-tracking` also exposes a **ประเภทการขออนุญาต** column/filter. If it means the same thing, it has the same
defect. The stakeholder scoped this fix to move-license + a10 and said it is the **first** of several, so Sober must
**not** touch tracking until they confirm.

---
## Retrospective — why this was missed (Porter, owning it)
1. **We inferred meaning from data shape.** DR-17 proved which *values* exist; we let that stand in for what the field
   *means*. Values can be a subset of many domains — the business rule is not recoverable from a histogram.
2. **The domain knowledge existed in the repo and we did not read it.** `DidSpf.WebApi.Center/CLAUDE.md` documents the
   shadow อ.9 / ref-request relationship. Nobody consulted it before specifying a request-type field.
3. **Precedent we should have followed:** every time we *measured* instead of assuming (roll-up A ≡ B, MISMATCH = 0,
   buyer-group blast radius, the chart-type census) the measurement changed the decision. The one place we reasoned
   from plausibility instead — DR-17's "it must be MoveRequestType" — is the one that is now being redone.

**Process change proposed to @Sober:** for any field whose value is a *code*, the SPEC must state its **business
meaning and source table/column path**, not just its label group — and if that path cannot be traced in the schema or
the repo docs, it is a stakeholder question, not an inference. Cheap to do, and it is precisely what would have caught
this one.

@Sober — SPEC + TASK. Hold the code until the DATA REQUEST lands; the two queries decide the MV predicate and whether
3 buckets are actually enough.

---
## ✅ 2026-07-24 — DATA REQUEST answered. Model CONFIRMED, and the NULL-vs-0 trap is REAL. @Sober — GO.

### Query 1 — parent-type distribution (proves 3 buckets are exactly right)
| bucket | requests |
|---|---|
| **MV** (no parent) | **2,397** |
| parent `REQUEST_TYPE = 5` → **SD** | **426** |
| parent `REQUEST_TYPE = 6` → **EX** | **20** |

**No parent carries a `REQUEST_TYPE` outside {5, 6}.** ⇒ the `ReqMovePermitType` 3-value model covers 100% of real
data; there is no 4th bucket to ask about, and no "unknown" fallback will ever fire on today's data. Keep a defensive
fallback anyway (an unmapped parent type must not render blank) but it should be unreachable — say so in the code
comment rather than inventing a label for it.

### Query 2 — how "no parent" is stored (the trap was worth checking)
| kind | rows |
|---|---|
| `NULL` | 2,390 |
| **`ZERO`** | **7** |
| HAS PARENT | 446 |

⇒ **both encodings exist.** The MV predicate **must** be `REF_REQUEST_ID IS NULL OR REF_REQUEST_ID = 0`.
Had we written `IS NULL` only, **7 อ.9 would have fallen through to the parent lookup, matched no parent row, and
rendered as blank/unknown instead of MV** — a silent, low-volume wrong answer of exactly the kind that is never found
by eyeballing a dashboard. (`TTRequestEntity.RefRequestId` defaulting to `0` was the tell.)

**Cross-check:** 2,390 + 7 = 2,397 = the MV bucket, and 426 + 20 = 446 = HAS PARENT. The two queries reconcile exactly,
so neither is measuring something other than what we think.

### Status
**Unblocked — no open questions.** Everything needed is in this REQ: the 3 options, the `SEQUENCE` order, the
MV/SD/EX ⇄ 3/5/6 constant, the chain-walk rule, the NULL-or-0 predicate, and the confirmed absence of a 4th bucket.
@Sober — SPEC + TASK now.
