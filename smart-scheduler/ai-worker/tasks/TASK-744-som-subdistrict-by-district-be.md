# TASK-744 — REQ-124 K4 = B: `demographics.subdistrictByDistrict` (the sub-district under each district) — BE, S (≈ 0.75 d → 0.8 d)
- Source: REQ-124 "K4 answered" (Khwan: *"B ka"*: district + a click-through to the sub-district) · my shape in `inbox/PM.md` (2026-10-19) · Porter GRANT 2026-10-19
- Status: ✅ DONE (Silver, 2026-10-19) · uncommitted
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-19)
- **Claim (inside REQ-124's grant):** `src/lib/som-contract.ts` · `src/services/som-contract.service.ts` · `src/types/contract.ts` · `src/openapi/document.ts` · the 741 test + set. No new file or route. 🚫 `demographics.district` stays BYTE-IDENTICAL; the old SOM files stay at a 0-line diff. A mirror pin that follows only from this edit is mine to grant; list it. 🔴 SAFE test command. Nothing committed.

## Build
- Add a NEW field `demographics.subdistrictByDistrict`: `Record<districtKey, Breakdown>`.
  - The keys are exactly the district card's bucket keys (`unknown` excluded).
  - **The same people + filters** as the district card: students who attended in `month`, the badge OR, each child once.
- Inside each district:
  - bucket `key` = the parent's `subdistrictCode`;
  - `label` = the sub-district's Thai name (`areaName(code, "TH")`, injected like `districtLabel`);
  - `known` = people with a sub-district code in the dataset;
  - `unknown` = the rest of that district's people;
  - `total` = that district's `count`;
  - sorted by count desc, `unknown` last, every bucket sent.
- A code outside the dataset ⇒ `unknown` (never a bucket with no name). The same rule as district.

## Definition of Done
- [ ] **By-value tests:**
  - two sub-districts in one district (2 + 1) ⇒ its total 3;
  - a person in the district with no sub-district ⇒ `unknown`;
  - the keys = the district buckets;
  - the badge filter and `month` change it the same way as District;
  - `district` itself unchanged.
- [ ] **Mutation set (added to 741's):** `total` ≠ the district count · a sub-district counted under the wrong district · `unknown` dropped · the filters ignored.
- [ ] tsc · full suite (SAFE) with counts · all 4 REQ-124 sets still bite · the old SOM files and `demographics.district`'s code path: a 0-line diff.

## Implementation Notes
**Evidence (Bob, 2026-10-19):** full SAFE **4939 pass / 0 fail (357 files)** · tsc 0 · 741's test now 52 pass (4 new by-value tests) · sets **741 45/45** (+M41–M45) · **742 47/47 · 743 25/25 · 737 11/11**, every CHECKSUM identical · the old SOM files and `getDailyReport`: 0-line diff. Nothing committed. No new file, no outside-claim edit, no mirror pin needed.

**Files (the claim):** `src/lib/som-contract.ts` (+ `subdistrictsOf`; `SomStudent.subdistrictCode?`; `SomContractInput.subdistrictLabel?`; the `demographics` type) · `src/services/som-contract.service.ts` (reads the active parent's `subdistrictCode`; `subdistrictLabel` = `areaName(code, "TH")`) · `src/types/contract.ts` · the 741 test + set. `openapi/document.ts` needed nothing: the path already says «SomReport» without per-field schemas.

**The field:** `demographics.subdistrictByDistrict: Record<districtKey, Breakdown>`. The keys are exactly the district card's bucket keys (`unknown` excluded, so a child with no / unknown district is in none). It is built from the SAME `people` and the SAME `districtKey` as the district card (so month, badge OR and once-per-child apply identically); `district` is untouched — the line is unchanged, the new field is added after it.
Per district: bucket key = the sub-district code, label = its Thai name; sorted by count then key, `unknown` last, every bucket sent; `total` = the district's `count`.
**Decision (internal):** a child's sub-district counts only when its code is in the dataset AND starts with his district code (a 6-digit code contains its 4-digit district). A code from another district, or one outside the dataset, is that district's `unknown` — never a bucket with no name, never a sub-district under the wrong district. REQ-118's doors already enforce consistency, so in clean data the prefix check never fires; it is a guard.

## Questions
None.

## Review

**Silver, 2026-10-19 — ✅ FINAL: DONE.**
- **My re-run (SAFE):** **4939 / 0** · tsc 0 · sets **741 45/45 · 742 47/47 · 743 25/25 · 737 11/11**, all `CHECKSUM identical`.
- **Unchanged:** the old SOM / daily code is a 0-line diff. In `som-contract.ts` the only removed line is the `demographics` type, widened to add `subdistrictByDistrict`. The district logic is untouched.
- **Bob's choice, accepted:** a sub-district code that sits outside the child's district (prefix check) counts as that district's `unknown`.
