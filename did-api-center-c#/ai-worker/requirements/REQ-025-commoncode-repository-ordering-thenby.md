# REQ-025: `TSCommonCodeRepository` — `.OrderBy().OrderBy()` discards the first sort; must be `.ThenBy()`

- Status: **CANCELLED / WONT-FIX (stakeholder, 2026-08-10)** — do not spec, do not code
- Priority: MEDIUM (correctness; no crash, no build impact)
- Raised: 2026-08-10 — was KNOWN-ISSUE-01. Stakeholder: **"แก้เลย"**, and **"เขาเห็นแล้วฝากแก้เลย"** —
  the code owner has seen it and asked us to fix it. **Authorisation to touch non-dashboard code is explicit.**

## The bug (3 lines, `DidSpf.Oracle.DataAccess.SPF/Repositories/TSCommonCodeRepository.cs`)
```csharp
L23  GetDataAll()                    return data.OrderBy(o => o.GroupCode).OrderBy(o => o.Sequence).ToList();
L32  GetDataByGroupCode(...)         return data.OrderBy(o => o.Sequence).OrderBy(o => o.Id).ToList();
L41  GetDataActiveByGroupCode(...)   return data.OrderBy(o => o.Sequence).OrderBy(o => o.Id).ToList();
```
A second `.OrderBy()` **re-sorts the whole sequence** — it does not add a tie-breaker. LINQ's sort is stable, so the
first key survives only *within ties of the second*, and since the second key is unique (`Id`) it is discarded entirely.

| line | intended order | actual order today |
|---|---|---|
| L23 | GroupCode, then Sequence | **Sequence only** — GroupCode grouping lost |
| L32 | Sequence, then Id | **Id only** — SEQUENCE ignored |
| L41 | Sequence, then Id | **Id only** — SEQUENCE ignored |

⇒ fix is `.OrderBy(first).ThenBy(second)` on all three. **No signature, no query, no behaviour beyond ordering.**

## Provenance — pre-existing, not ours (git blame)
| line | author | date |
|---|---|---|
| L23 | Turakorn | 2025-09-30 |
| L32 | Turakorn | 2025-11-07 |
| L41 | Turakorn | 2025-11-07 |

The dashboard team has **never** touched this file (last 5 commits all Turakorn, latest 2025-12-17, before the
dashboard work began). Found by Jason while wiring REQ-021; he **recorded it and did not fix it** — correct call at the
time, since it was out of scope and unauthorised. It is now authorised by the owner.

## Blast radius — **77 call sites, none of them dashboards**
| file | calls |
|---|---|
| `ReferenceController.cs` | 29 |
| `PaymentInformService.cs` | 12 |
| `TraderPlantMachinesController.cs` | 6 |
| `UsersController.cs` | 5 |
| `TraderService.cs` | 4 |
| `TraderPlantBuildingsController.cs` · `TraderPerService.cs` · `CommonCodesController.cs` | 3 each |
| `RequestProjectInvestmentHolderController.cs` · `RequestPerService.cs` · `RequestBgChkController.cs` | 2 each |
| `TraderPlantOfficersController.cs` · `TraderBankAccsController.cs` · `RequestSpecialService.cs` · `RequestProjectCapacityMachinesController.cs` · `LicenseInformService.cs` · `CommonCodeService.cs` | 1 each |

**The 6 dashboard sites are NOT affected** — REQ-021/TASK-039 moved them to
`GetDataActiveByGroupCodeAndDisplayType`, which orders in **SQL** (`ORDER BY SEQUENCE ASC, ID ASC`) and is already
correct. So this REQ cannot regress anything we just captured. Sober should confirm that separation still holds.

## What Sober must settle before Jason codes
1. **Does any caller re-sort after the call?** A quick scan found ~1 site with an `OrderBy` near the call — if a caller
   already imposes its own order, the fix is invisible there. Enumerate them so the "what changed" list is honest.
2. **`GetDataAll` (L23) is the riskiest of the three** — it changes from a flat Sequence sort to GroupCode-then-Sequence,
   which reorders *every* consumer's list, not just within a group. Its 4 callers (`CommonCodesController` L132,
   `TraderBankAccsController` L364, `PaymentInformService` L203/L284) should be looked at individually.
3. Any other repository in the DAL with the same `.OrderBy().OrderBy()` shape — worth one grep while we are here.
   **Report, do not fix** anything outside this file without a separate authorisation; the owner approved *this*.

## Verification — be honest about what we can and cannot prove
- ✅ We can prove: build clean, exactly 3 lines changed, `ThenBy` used, dashboards untouched, and that the emitted
  order now follows `SEQUENCE` for a group we can read from `T_S_COMMON_CODE`.
- ⛔ We **cannot** capture the 77 consumer screens — they are outside this workstream and the stakeholder does not
  drive them. **Porter to relay to the owner that they should eyeball their own dropdown orders after deploy**, since
  the visible effect is exactly "dropdowns re-order". Do not claim this is verified end-to-end.

## Acceptance
- [ ] All 3 returns use `.OrderBy(...).ThenBy(...)`; no `.OrderBy(...).OrderBy(...)` left in the file.
- [ ] `dotnet build` → 0 errors.
- [ ] Dashboard behaviour unchanged (they use the `…AndDisplayType` overload — verify, don't assume).
- [ ] The list of consumers whose visible order changes is written down and relayed to the owner.

@Sober — SPEC + TASK. Small change, wide reach: the risk is in the reach, not the code.

---
## ⛔ CANCELLED 2026-08-10 — stakeholder decision: **"งั้น ไม่แก้"**
Reversed immediately after Porter laid out the blast radius: **3 lines to change, 77 consumer call sites whose visible
effect is dropdown re-ordering, and not one of them capturable by this workstream.** A change we cannot verify, in
screens we do not own, to fix an issue that is currently causing no reported problem — the cost/benefit does not hold.

**Nothing is lost by not doing it:**
- No dashboard is affected (they use the SQL-ordered `…AndDisplayType` overload — REQ-021/TASK-039).
- Impact on the other screens is low in practice: `ID` is broadly insertion-ordered, so most groups already *look*
  right; only groups whose `SEQUENCE` was edited after insert are visibly off.

**Re-recorded as a known issue** so the knowledge is not lost — the analysis in this file (exact lines, provenance,
77-site inventory, the `GetDataAll` risk) stands ready if anyone picks it up later.
**@Sober — drop this from your queue; no SPEC, no TASK.**
